import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { encoding_for_model } from 'tiktoken';
import { supabase } from './supabaseClient.js';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

// Initialize Stripe
console.log('🔑 Checking Stripe configuration...');
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('STRIPE_SECRET_KEY length:', process.env.STRIPE_SECRET_KEY?.length || 0);
console.log('STRIPE_SECRET_KEY first 10 chars:', process.env.STRIPE_SECRET_KEY?.substring(0, 10) || 'undefined');
console.log('STRIPE_SECRET_KEY last 10 chars:', process.env.STRIPE_SECRET_KEY?.substring(-10) || 'undefined');

// Check for common invalid characters
if (process.env.STRIPE_SECRET_KEY) {
  const key = process.env.STRIPE_SECRET_KEY;
  const hasNewlines = key.includes('\n');
  const hasCarriageReturns = key.includes('\r');
  const hasLeadingSpaces = key.startsWith(' ');
  const hasTrailingSpaces = key.endsWith(' ');
  const hasTabs = key.includes('\t');
  
  console.log('🔍 Key validation:');
  console.log('- Has newlines:', hasNewlines);
  console.log('- Has carriage returns:', hasCarriageReturns);
  console.log('- Has leading spaces:', hasLeadingSpaces);
  console.log('- Has trailing spaces:', hasTrailingSpaces);
  console.log('- Has tabs:', hasTabs);
  console.log('- Starts with sk_:', key.startsWith('sk_'));
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const app = express();
const PORT = 5050;

// Rate limiting store for API requests
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 3; // Maximum 3 requests per minute per user
const MIN_REQUEST_INTERVAL = 10 * 1000; // Minimum 10 seconds between requests

// Rate limiting function
const checkRateLimit = (userId) => {
  const now = Date.now();
  const userKey = `user_${userId}`;
  
  if (!rateLimitStore.has(userKey)) {
    rateLimitStore.set(userKey, { requests: [], lastRequest: 0 });
  }
  
  const userData = rateLimitStore.get(userKey);
  
  // Check minimum interval between requests (debounce)
  if (now - userData.lastRequest < MIN_REQUEST_INTERVAL) {
    return {
      allowed: false,
      reason: 'debounce',
      retryAfter: Math.ceil((MIN_REQUEST_INTERVAL - (now - userData.lastRequest)) / 1000)
    };
  }
  
  // Clean old requests outside the window
  userData.requests = userData.requests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  // Check if user has exceeded rate limit
  if (userData.requests.length >= MAX_REQUESTS_PER_MINUTE) {
    return {
      allowed: false,
      reason: 'rate_limit',
      retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - userData.requests[0])) / 1000)
    };
  }
  
  // Allow request and update tracking
  userData.requests.push(now);
  userData.lastRequest = now;
  rateLimitStore.set(userKey, userData);
  
  return { allowed: true };
};

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, userData] of rateLimitStore.entries()) {
    // Remove entries older than the window and with no recent activity
    if (now - userData.lastRequest > RATE_LIMIT_WINDOW * 2) {
      rateLimitStore.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW);

// Middleware
app.use(cors());
// Raw body parsing for Stripe webhooks
app.use('/api/stripe-webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Usage tracking functions
const getTodaysDate = () => {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
};

const checkDailyUsage = async (userId) => {
  const today = getTodaysDate();
  
  try {
    // Get user profile to check if premium
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, daily_question_limit')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return { canGenerate: false, error: 'Failed to verify user account' };
    }

    // Premium users have unlimited questions
    if (profile.subscription_tier === 'premium' || profile.subscription_tier === 'enterprise') {
      return { canGenerate: true, usage: 0, limit: 'unlimited', isPremium: true };
    }

    // Get today's usage for non-premium users
    const { data: usageLog, error: usageError } = await supabase
      .from('usage_logs')
      .select('questions_generated')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    const currentUsage = usageLog ? usageLog.questions_generated : 0;
    const dailyLimit = profile.daily_question_limit || 30;

    return {
      canGenerate: currentUsage < dailyLimit,
      usage: currentUsage,
      limit: dailyLimit,
      isPremium: false
    };
  } catch (error) {
    console.error('Error checking daily usage:', error);
    return { canGenerate: false, error: 'Failed to check usage limits' };
  }
};

const logUsage = async (userId, questionsGenerated) => {
  const today = getTodaysDate();
  const now = new Date().toISOString();

  try {
    // Try to update existing record
    const { data: existingLog, error: fetchError } = await supabase
      .from('usage_logs')
      .select('id, questions_generated')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existingLog) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('usage_logs')
        .update({
          questions_generated: existingLog.questions_generated + questionsGenerated,
          last_generated_at: now
        })
        .eq('id', existingLog.id);

      if (updateError) {
        console.error('Error updating usage log:', updateError);
        return false;
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('usage_logs')
        .insert({
          user_id: userId,
          date: today,
          questions_generated: questionsGenerated,
          last_generated_at: now
        });

      if (insertError) {
        console.error('Error creating usage log:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error logging usage:', error);
    return false;
  }
};

// Mock data structures (same as before)
// const specifications = {
//   gcse: {
//     aqa: {
//       mathematics: {
//         exam_board: 'AQA',
//         qualification: 'GCSE',
//         subject: 'Mathematics',
//         command_words: ['calculate', 'solve', 'find', 'show', 'prove', 'explain'],
//         topics: [
//           { name: 'Number', subtopics: ['Fractions', 'Decimals', 'Percentages', 'Ratio'] },
//           { name: 'Algebra', subtopics: ['Linear equations', 'Quadratic equations', 'Graphs'] },
//           { name: 'Geometry', subtopics: ['Area', 'Volume', 'Angles', 'Pythagoras'] }
//         ]
//       },
//       physics: {
//         exam_board: 'AQA',
//         qualification: 'GCSE',
//         subject: 'Physics',
//         command_words: ['describe', 'explain', 'calculate', 'compare', 'evaluate'],
//         topics: [
//           { name: 'Forces', subtopics: ['Newton\'s laws', 'Pressure', 'Moments'] },
//           { name: 'Energy', subtopics: ['Kinetic energy', 'Potential energy', 'Conservation'] }
//         ]
//       },
//       chemistry: {
//         exam_board: 'AQA',
//         qualification: 'GCSE',
//         subject: 'Chemistry',
//         command_words: ['describe', 'explain', 'calculate', 'compare', 'evaluate'],
//         topics: [
//           { name: 'Atomic structure', subtopics: ['Atoms', 'Elements', 'Compounds'] },
//           { name: 'Chemical reactions', subtopics: ['Acids', 'Bases', 'Oxidation'] }
//         ]
//       },
//       biology: {
//         exam_board: 'AQA',
//         qualification: 'GCSE',
//         subject: 'Biology',
//         command_words: ['describe', 'explain', 'compare', 'evaluate', 'analyse'],
//         topics: [
//           { name: 'Cell biology', subtopics: ['Cell structure', 'Cell division', 'Transport'] },
//           { name: 'Organisation', subtopics: ['Digestive system', 'Circulatory system'] }
//         ]
//       }
//     },
//     edexcel: {
//       mathematics: {
//         exam_board: 'Edexcel',
//         qualification: 'GCSE',
//         subject: 'Mathematics',
//         command_words: ['calculate', 'solve', 'find', 'show', 'prove', 'explain'],
//         topics: [
//           { name: 'Number', subtopics: ['Fractions', 'Decimals', 'Percentages'] },
//           { name: 'Algebra', subtopics: ['Linear equations', 'Quadratic equations'] }
//         ]
//       }
//     }
//   },
//   ks3: {
//     aqa: {
//       mathematics: {
//         exam_board: 'AQA',
//         qualification: 'KS3',
//         subject: 'Mathematics',
//         command_words: ['calculate', 'solve', 'find', 'explain'],
//         topics: [
//           { name: 'Number', subtopics: ['Basic arithmetic', 'Fractions', 'Decimals'] },
//           { name: 'Algebra', subtopics: ['Simple equations', 'Sequences'] }
//         ]
//       }
//     }
//   }
// };

// const examples = {
//   gcse: {
//     aqa: {
//       mathematics: {
//         easy: 'Example: Calculate 15% of 80. Show your working.',
//         medium: 'Example: Solve the equation 3x + 7 = 22. Show your working.',
//         hard: 'Example: Prove that the sum of any two consecutive odd numbers is always even.'
//       },
//       physics: {
//         easy: 'Example: State the unit of force.',
//         medium: 'Example: Calculate the pressure when a force of 20N acts on an area of 4m².',
//         hard: 'Example: Explain how Newton\'s third law applies to rocket propulsion.'
//       }
//     }
//   }
// };

// const gcseExamTemplates = {
//   mathematics: [
//     `Question: 
// Calculate {calculation_topic}
// Show your working clearly.`,
    
//     `Question: 
// Solve the equation: {equation}
// Show all your working.`
//   ],
  
//   physics: [
//     `Question: 
// Describe {physics_process}
// Include the following in your answer:
// • {point_1}
// • {point_2}
// • {point_3}`,
    
//     `Question: 
// Calculate {physics_calculation}
// Given: {given_values}
// Show your working.`
//   ],
  
//   chemistry: [
//     `Question: 
// Explain {chemistry_process}
// Your answer should include:
// • {aspect_1}
// • {aspect_2}
// • {aspect_3}`
//   ],
  
//   biology: [
//     `Question: 
// Describe the process of {biological_process}
// Include the following in your answer:
// • {step_1}
// • {step_2}
// • {step_3}`
//   ]
// };

// Function to remove the mark scheme from a question
function removeMarkScheme(question) {
  const markSchemeIndex = question.indexOf('Mark Scheme:');
  if (markSchemeIndex !== -1) {
    return question.substring(0, markSchemeIndex).trim();
  }
  return question;
}

// Utility function to normalize answers
function normalizeAnswer(answer) {
  if (typeof answer === 'object' && answer !== null && !Array.isArray(answer)) {
    // Convert any object to an array of { step, explanation }
    return Object.keys(answer).map(key => {
      const value = answer[key];
      return { step: key, explanation: value };
    });
  }
  return answer;
}

// OpenAI function
const generateQuestions = async (prompt) => {
  console.log('🤖 Calling OpenAI API...');
  console.log('📝 Prompt being sent:', prompt.substring(0, 200) + '...');
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert exam question writer. Always respond with valid JSON containing a "questions" array. Do not include any text outside the JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API Error Response:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '');
    
    console.log('🤖 OpenAI Response received:', content.substring(0, 200) + '...');
    
    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response as JSON:', content);
      console.error('❌ Parse error:', parseError.message);
      throw new Error('Invalid JSON response from OpenAI');
    }
    
    // Return the questions array
    return parsedResponse.questions || parsedResponse;
    
  } catch (error) {
    console.error('❌ OpenAI API Error:', error);
    throw error;
  }
};

// Count tokens for GPT-4
const encoding = encoding_for_model('gpt-4');


app.post('/api/generate-questions', async (req, res) => {
  try {
    console.log('\n📝 Generate Questions Request:');
    console.log('- Body:', JSON.stringify(req.body, null, 2));
    
    const { subject, topic, numQuestions = 5, difficulty, examLevel, examBoard, userId } = req.body;
    
    // Validate input
    if (!subject) {
      console.log('❌ Error: Subject is required');
      return res.status(400).json({ error: 'Subject is required' });
    }
    if (!topic) {
      console.log('❌ Error: Topic is required');
      return res.status(400).json({ error: 'Topic is required' });
    }
    if (!userId) {
      console.log('❌ Error: User ID is required');
      return res.status(401).json({ error: 'User authentication required' });
    }
    if (numQuestions > 30) {
      console.log('❌ Error: Too many questions requested');
      return res.status(400).json({ error: 'Max 30 questions allowed' });
    }

    if (!['easy', 'medium', 'hard', 'mixed'].includes(difficulty)) {
      console.log('❌ Error: Invalid difficulty');
      return res.status(400).json({ error: 'Invalid difficulty - ' + difficulty });
    }

    if (!['gcse', 'ks3', 'alevel', 'university'].includes(examLevel)) {
      console.log('❌ Error: Invalid exam level');
      return res.status(400).json({ error: 'Invalid Exam Level - ' + examLevel });
    }

    if (examLevel === "gcse") {
      if (!['aqa', 'edexcel', 'ocr', 'wjec', 'ci'].includes(examBoard)) {
        console.log('❌ Error: Invalid exam board');
        return res.status(400).json({ error: 'Invalid Exam Board - ' + examBoard });
      }
    }

    // Check rate limiting (prevent spam requests)
    console.log('🚦 Checking rate limits for user:', userId);
    const rateLimitCheck = checkRateLimit(userId);
    
    if (!rateLimitCheck.allowed) {
      const errorMessage = rateLimitCheck.reason === 'debounce' 
        ? `Please wait ${rateLimitCheck.retryAfter} seconds before making another request. This prevents spam and ensures quality responses.`
        : `Too many requests. You can make up to ${MAX_REQUESTS_PER_MINUTE} requests per minute. Please wait ${rateLimitCheck.retryAfter} seconds.`;
      
      console.log(`❌ Rate limit exceeded for user ${userId}: ${rateLimitCheck.reason}`);
      return res.status(429).json({ 
        error: errorMessage,
        retryAfter: rateLimitCheck.retryAfter,
        reason: rateLimitCheck.reason
      });
    }
    
    console.log('✅ Rate limit check passed for user:', userId);

    // Check daily usage limits
    console.log('🔍 Checking daily usage limits for user:', userId);
    const usageCheck = await checkDailyUsage(userId);
    
    if (!usageCheck.canGenerate) {
      console.log('❌ Daily limit reached for user:', userId);
      return res.status(429).json({ 
        error: usageCheck.error || 'Daily question limit reached. Upgrade to premium for unlimited questions.',
        usage: usageCheck.usage,
        limit: usageCheck.limit,
        isPremium: usageCheck.isPremium
      });
    }

    console.log(`✅ Usage check passed. Current usage: ${usageCheck.usage}/${usageCheck.limit === 'unlimited' ? '∞' : usageCheck.limit}`);

    // Get the specification and example questions
    let exampleQuestions = null;
    try {
      exampleQuestions = await import(`./server/examples/${examLevel}/${examBoard ? "${examBoard}/" : ""}${subject}/${subject}.json`, {type: 'json'});
      console.log("Example questions:", exampleQuestions)
    } catch (error) {
      console.log('⚠️ Warning: Examples questions not found, using fallback');
    }
    
    let specData = null;
    try {
      specData = await import(`./server/specifications/${examLevel}/${examBoard ? "${examBoard}/" : ""}${subject}/${subject}.json`, { with: { type: "json" } });
      console.log("Spec data:", specData)
    } catch (error) {
      console.log('⚠️ Warning: Specification not found, using fallback');
    }

    // Construct the prompt
    let prompt = '';

    if (exampleQuestions) {
      // Pick a random template for variety
      const topicsText = specData.topics ? specData.topics.map(t => 
        `- ${t.name}: ${t.subtopics ? t.subtopics.join(', ') : ''}`
      ).join('\n') : '';
      
      prompt = `
You are an expert ${examLevel} ${subject} exam question writer${examBoard ? ` for the ${examBoard.toUpperCase()} board` : ""}.

CRITICAL INSTRUCTION: You MUST create questions specifically about "${topic}". Do NOT use generic examples.

TEMPLATE INSTRUCTIONS:
- Create questions that are directly related to the topic "${topic}"
- Keep appropriate mark allocations and formatting
- Make the question realistic for ${difficulty} difficulty level
- DO NOT include any mark scheme or marking criteria in the question text
- NEVER include marks like [4 marks] or (4 marks) in the question text itself
- The question text should ONLY contain the actual question without any mark indicators

IMPORTANT: For each question:
- In the answer, break down the solution step by step, and for each step, indicate in brackets how many marks are awarded for that part.

TOPIC: ${topic}
DIFFICULTY: ${difficulty}

Generate ${numQuestions} questions specifically about "${topic}".
Only get subtopics from this list of topics: ${topicsText}

FORMATTING RULES:
- Write all mathematical expressions in plain text (no LaTeX, no dollar signs)
- Use simple notation: x^2 instead of x², 3/4 instead of fractions
- Use parentheses for clarity: (2x + 3)(x - 4)
- Keep formatting simple and readable

${specData ? `
SPECIFICATION CONTEXT:
- Exam Board: ${specData.exam_board}
- Subject: ${specData.subject}
- Command words: ${specData.command_words ? specData.command_words.join(', ') : 'explain, describe, analyse, evaluate'}
` : ''}

CRITICAL: The "question" field must NOT contain any marks like [4 marks] or (4 marks). Only include the actual question text. The marks will be provided separately in the "marks" field.

Return as a JSON object with a "questions" array. Each question object must have:
- "question": The exam question with instructions (NO mark scheme, NO marks in brackets)
- "answer": A detailed answer following the mark scheme, with mark breakdowns as shown above
- "marks": Total marks as a number
      `;
    } else if (specData) {
      console.log("Falling back to spec data")
      // Use specification data for non-template subjects
      const topicsText = specData.topics ? specData.topics.map(t => 
        `- ${t.name}: ${t.subtopics ? t.subtopics.join(', ') : ''}`
      ).join('\n') : '';
      prompt = `
      You are an expert ${examLevel} ${subject} exam question writer${examBoard ? ` for ${examBoard.toUpperCase()} board` : ""}.
      
      Create ${numQuestions} ${difficulty} questions about "${topic}".

      Only get subtopics from this list of topics: ${topicsText}
      
      RULES:
      - Do NOT include marks like [4 marks] in question text
      - Break down answers step by step with mark allocations
      - Use plain text math (x^2, not LaTeX)
      
      ${specData ? `Exam Board: ${specData.exam_board} | ${specData?.command_words ? "Command words: ${specData.command_words.join(', ')}" : ""}` : ''}

      EXAMPLES:
      ${exampleQuestions}
      
Return JSON format:
      {
        "questions": [
          {
            "question": "question text only",
            "answer": "step-by-step answer with (X marks) for each step",
            "marks": total_number
          }
        ]
      }
            `;
    } else {
      // Fallback prompt
      console.log("Falling back to basic prompt")
      prompt = `
    Generate ${numQuestions} ${difficulty} exam-style questions about ${topic} in ${subject} for ${examLevel} level.

    RULES:
    - Do NOT include marks like [4 marks] in question text
    - Break down answers step by step with mark allocations
    - Use plain text math (x^2, not LaTeX)

    Return JSON format:
    {
      "questions": [
        {
          "question": "question text only",
          "answer": "step-by-step answer with (X marks) for each step",
          "marks": total_number
        }
      ]
    }
          `;
    }

    console.log(`✨ Generating ${numQuestions} ${difficulty} questions about ${topic} in ${subject} (${examLevel} ${examBoard})`);
    const questions = await generateQuestions(prompt);
    
    // Validate response structure
    if (!Array.isArray(questions)) {
      console.log('❌ Error: Invalid question format returned');
      throw new Error('AI returned invalid question format');
    }

    // Validate each question has required fields
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question) {
        console.log(`❌ Error: Question ${i + 1} missing question field:`, questions[i]);
        throw new Error(`Question ${i + 1} is missing question field`);
      }
      // Ensure marks field exists
      if (!questions[i].marks && questions[i].question) {
        // Try to extract marks from question text
        const markMatch = questions[i].question.match(/\[(\d+)\s*marks?\]/i);
        if (markMatch) {
          questions[i].marks = parseInt(markMatch[1]);
        } else {
          questions[i].marks = 1; // default
        }
      }
      // Post-process to remove any mark scheme that might have leaked through
      questions[i].question = removeMarkScheme(questions[i].question);

      // Remove marks from question text since frontend displays them separately
      questions[i].question = questions[i].question
        .replace(/\[\s*\d+\s*marks?\s*\]/gi, '')  // [4 marks], [4mark], etc.
        .replace(/\(\s*\d+\s*marks?\s*\)/gi, '')  // (4 marks), (4mark), etc.
        .replace(/\d+\s*marks?\s*[\[\(]/gi, '')   // 4 marks[, 4 mark(, etc.
        .replace(/^\s*\[\s*\d+\s*marks?\s*\]\s*/gi, '') // [4 marks] at start
        .trim();
        
      // Normalize the answer field
      questions[i].answer = normalizeAnswer(questions[i].answer);
    }

    // Log the usage after successful generation
    console.log('📊 Logging usage for user:', userId, 'Questions generated:', numQuestions);
    const logSuccess = await logUsage(userId, numQuestions);
    
    if (!logSuccess) {
      console.log('⚠️ Warning: Failed to log usage, but continuing with response');
    }

    console.log('✅ Successfully generated questions');
    res.json(questions);
  } catch (error) {
    console.error('❌ Server Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate questions',
      details: error.message 
    });
  }
});

// Add the generate solutions endpoint
app.post('/api/generate-solutions', async (req, res) => {
  try {
    console.log('\n🔧 Generate Solutions Request:');
    console.log('- Body:', JSON.stringify(req.body, null, 2));
    
    const { questions } = req.body;
    
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'Questions array is required' });
    }
    
    // Transform object answers to arrays to prevent React errors
    const processedQuestions = questions.map(question => {
      question.answer = normalizeAnswer(question.answer);
      return question;
    });
    
    console.log('✅ Successfully generated solutions');
    res.json(processedQuestions);
  } catch (error) {
    console.error('❌ Server Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate solutions',
      details: error.message 
    });
  }
});

// Add endpoint to check user's current usage
app.get('/api/usage/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('📊 Checking usage for user:', userId);
    const usageCheck = await checkDailyUsage(userId);
    
    res.json({
      usage: usageCheck.usage,
      limit: usageCheck.limit,
      isPremium: usageCheck.isPremium,
      canGenerate: usageCheck.canGenerate
    });
  } catch (error) {
    console.error('❌ Error checking usage:', error);
    res.status(500).json({ 
      error: 'Failed to check usage',
      details: error.message 
    });
  }
});

// Add Stripe checkout session creation endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { userId, priceType, successUrl, cancelUrl } = req.body;
    
    if (!userId || !priceType || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log('💳 Creating Stripe checkout session for user:', userId, 'Type:', priceType);
    
    let userEmail = null;
    let userName = null;
    
    // Method 1: Try to get email from auth.users table
    try {
      console.log('🔍 Attempting to get user from auth.users...');
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);

      if (authError) {
        console.error('❌ Auth error:', authError);
      } else if (authUser && authUser.user) {
        console.log('✅ Auth user found:', {
          id: authUser.user.id,
          email: authUser.user.email,
          emailConfirmed: authUser.user.email_confirmed_at
        });
        userEmail = authUser.user.email;
        userName = authUser.user.user_metadata?.full_name;
      } else {
        console.log('⚠️ Auth user structure unexpected:', authUser);
      }
    } catch (authFetchError) {
      console.error('❌ Exception getting auth user:', authFetchError);
    }

    // Method 2: Fallback to profiles table if auth method failed
    if (!userEmail) {
      try {
        console.log('🔍 Falling back to profiles table...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('❌ Profile error:', profileError);
        } else if (profile) {
          console.log('✅ Profile found:', {
            email: profile.email,
            full_name: profile.full_name
          });
          userEmail = profile.email;
          userName = profile.full_name;
        }
      } catch (profileFetchError) {
        console.error('❌ Exception getting profile:', profileFetchError);
      }
    }

    // Final validation
    if (!userEmail) {
      console.error('❌ No email found after trying both methods for user:', userId);
      return res.status(400).json({ error: 'User email not found in auth or profile data' });
    }

    if (!userEmail.includes('@') || userEmail.length < 5) {
      console.error('❌ Invalid email format:', userEmail);
      return res.status(400).json({ error: 'Invalid email format found' });
    }

    console.log('✅ Final email to use:', userEmail);

    // Define price IDs (you'll need to create these in your Stripe dashboard)
    const priceIds = {
      monthly: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly_placeholder',
      yearly: process.env.STRIPE_YEARLY_PRICE_ID || 'price_yearly_placeholder'
    };

    console.log('💰 Using price ID:', priceIds[priceType]);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceIds[priceType],
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      customer_email: userEmail,
      metadata: {
        userId: userId,
        subscriptionType: priceType,
      },
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
    });
    
    console.log('✅ Stripe checkout session created successfully:', session.id);
    
    res.json({
      url: session.url
    });
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
});

// Stripe webhook endpoint (for handling successful payments)
app.post('/api/stripe-webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('🎣 Received Stripe webhook:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Webhook handler functions
async function handleCheckoutSessionCompleted(session) {
  console.log('✅ Processing checkout session completed:', session.id);
  
  const userId = session.client_reference_id;
  const subscriptionId = session.subscription;
  
  if (!userId) {
    console.error('No userId found in session metadata');
    return;
  }

  try {
    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0].price.id;
    
    // Determine subscription tier based on price
    let tier = 'premium';
    let billingPeriod = 'monthly';
    
    if (priceId === process.env.STRIPE_YEARLY_PRICE_ID) {
      billingPeriod = 'yearly';
    }

    // Update user profile in Supabase
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        daily_question_limit: null // Remove daily limit for premium users
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user subscription:', error);
      return;
    }

    // Log subscription history
    await supabase
      .from('subscription_history')
      .insert({
        user_id: userId,
        previous_tier: 'free',
        new_tier: tier,
        previous_status: 'active',
        new_status: 'active',
        reason: `Stripe subscription created: ${subscriptionId}`
      });

    console.log('✅ User upgraded to premium:', userId);
    
  } catch (error) {
    console.error('Error processing checkout session:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Processing subscription updated:', subscription.id);
  
  const userId = subscription.metadata.userId;
  if (!userId) return;

  try {
    const status = subscription.status === 'active' ? 'active' : 'cancelled';
    
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: status,
        subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating subscription:', error);
      return;
    }

    console.log('✅ Subscription updated for user:', userId);
  } catch (error) {
    console.error('Error processing subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('❌ Processing subscription deleted:', subscription.id);
  
  const userId = subscription.metadata.userId;
  if (!userId) return;

  try {
    // Downgrade user to free tier
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: 'free',
        subscription_status: 'cancelled',
        subscription_end_date: new Date().toISOString(),
        daily_question_limit: 30 // Restore daily limit
      })
      .eq('id', userId);

    if (error) {
      console.error('Error downgrading user:', error);
      return;
    }

    // Log subscription history
    await supabase
      .from('subscription_history')
      .insert({
        user_id: userId,
        previous_tier: 'premium',
        new_tier: 'free',
        previous_status: 'active',
        new_status: 'cancelled',
        reason: `Stripe subscription cancelled: ${subscription.id}`
      });

    console.log('✅ User downgraded to free:', userId);
  } catch (error) {
    console.error('Error processing subscription deletion:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  console.log('💰 Payment succeeded for subscription:', invoice.subscription);
  
  // Could add additional logic here for successful recurring payments
  // For now, subscription.updated webhook handles the main logic
}

async function handlePaymentFailed(invoice) {
  console.log('💸 Payment failed for subscription:', invoice.subscription);
  
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata.userId;
  
  if (!userId) return;

  // Could implement logic to handle failed payments
  // e.g., send notification emails, update subscription status, etc.
  console.log('⚠️ Payment failed for user:', userId);
}

// Create Stripe Customer Portal session
app.post('/api/create-portal-session', async (req, res) => {
  try {
    const { userId, returnUrl } = req.body;
    
    console.log('🏪 Creating customer portal session for user:', userId);
    console.log('📍 Return URL:', returnUrl);
    
    if (!userId || !returnUrl) {
      console.log('❌ Missing required parameters:', { userId: !!userId, returnUrl: !!returnUrl });
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Check if Stripe is configured
    if (!stripe) {
      console.log('❌ Stripe not configured');
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    // Get user profile to find their email
    console.log('🔍 Looking up user profile in Supabase...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.log('❌ Profile error:', profileError);
      return res.status(400).json({ error: 'User not found' });
    }

    if (!profile || !profile.email) {
      console.log('❌ No email found for user:', profile);
      return res.status(400).json({ error: 'User email not found' });
    }

    console.log('✅ Found user email:', profile.email);

    // Find or create Stripe customer
    let customer;
    try {
      console.log('🔍 Searching for existing Stripe customer...');
      // Try to find existing customer by email
      const customers = await stripe.customers.list({
        email: profile.email,
        limit: 1,
      });
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
        console.log('✅ Found existing Stripe customer:', customer.id);
      } else {
        console.log('👤 Creating new Stripe customer...');
        // Create new customer if none exists
        customer = await stripe.customers.create({
          email: profile.email,
          metadata: {
            userId: userId,
          },
        });
        console.log('✅ Created new Stripe customer:', customer.id);
      }
    } catch (stripeCustomerError) {
      console.error('❌ Error finding/creating customer:', stripeCustomerError);
      return res.status(500).json({ error: 'Failed to process customer data', details: stripeCustomerError.message });
    }

    // Create portal session
    try {
      console.log('🚪 Creating Stripe billing portal session...');
      const session = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: returnUrl,
      });

      console.log('✅ Customer portal session created successfully:', session.id);
      
      res.json({
        url: session.url
      });
    } catch (portalError) {
      console.error('❌ Error creating portal session:', portalError);
      return res.status(500).json({ 
        error: 'Failed to create portal session', 
        details: portalError.message 
      });
    }
  } catch (error) {
    console.error('❌ Unexpected error creating portal session:', error);
    res.status(500).json({ 
      error: 'Failed to create portal session',
      details: error.message 
    });
  }
});

// Cancel subscription endpoint
app.post('/api/cancel-subscription', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('❌ Processing subscription cancellation for user:', userId);

    // Get user's current subscription from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, subscription_tier')
      .eq('id', userId)
      .single();

    if (profileError || profile.subscription_tier === 'free') {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Find customer in Stripe
    const customers = await stripe.customers.list({
      email: profile.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return res.status(400).json({ error: 'Customer not found in Stripe' });
    }

    const customer = customers.data[0];

    // Get customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.status(400).json({ error: 'No active subscription found in Stripe' });
    }

    // Cancel the subscription at period end
    const subscription = subscriptions.data[0];
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    // Update database status
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'cancelled'
      })
      .eq('id', userId);

    // Log subscription history
    await supabase
      .from('subscription_history')
      .insert({
        user_id: userId,
        previous_tier: profile.subscription_tier,
        new_tier: profile.subscription_tier,
        previous_status: 'active',
        new_status: 'cancelled',
        reason: `User requested cancellation: ${subscription.id}`
      });

    console.log('✅ Subscription cancelled for user:', userId);
    
    res.json({ 
      success: true,
      message: 'Subscription will be cancelled at the end of the current billing period'
    });
  } catch (error) {
    console.error('❌ Error cancelling subscription:', error);
    res.status(500).json({ 
      error: 'Failed to cancel subscription',
      details: error.message 
    });
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // Create transporter - supports both Gmail and Microsoft email
    let transporterConfig;
    const emailUser = process.env.EMAIL_USER;
    
    if (emailUser && emailUser.includes('@gmail.com')) {
      // Gmail configuration
      transporterConfig = {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };
    } else if (emailUser && (emailUser.includes('@outlook.com') || emailUser.includes('@hotmail.com') || emailUser.includes('@live.com'))) {
      // Microsoft email configuration
      transporterConfig = {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };
    } else {
      // Default to Office 365 SMTP for non-Gmail addresses (includes business emails)
      transporterConfig = {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'aj@practiceqs.com',
      subject: `Contact Form Message from ${name}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>This message was sent from the PracticeQs contact form.</em></p>
      `,
      replyTo: email
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    console.log('✅ Contact form email sent successfully');
    res.json({ success: true, message: 'Message sent successfully!' });
    
  } catch (error) {
    console.error('❌ Error sending contact form email:', error);
    res.status(500).json({ 
      error: 'Failed to send message', 
      details: error.message 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
