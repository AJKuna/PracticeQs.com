import React, { useState, useEffect, useRef } from 'react';
//import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import PricingModal from './PricingModal';
import TopicDropdown from './TopicDropdown';
import FeedbackWidget from './FeedbackWidget';
import LoadingBar from './LoadingBar';
import StreakCounter, { StreakCounterRef } from './StreakCounter';
import StreakPopup from './StreakPopup';
import { API_CONFIG } from '../config/api';
import { trackQuestionGeneration, trackPDFExport, trackButtonClick, trackError, trackSubscription } from '../utils/analytics';
import { biologyGcseAqaUnits } from '../data/biologyGcseAqaUnits';
import { chemistryGcseAqaUnits } from '../data/chemistryGcseAqaUnits';
import { biologyGcseEdexcelUnits } from '../data/biologyGcseEdexcelUnits';
import { physicsGcseAqaUnits } from '../data/physicsGcseAqaUnits';
import { getUserStreak, updateStreakOnGeneration, StreakData } from '../services/streakService';

// ... (interfaces and constants unchanged)

const QuestionGenerator: React.FC = () => {
  const { subject } = useParams<{ subject: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const normalizedSubject = subject?.replace(/-/g, ' ') || 'mathematics';

  // State
  const [searchTopic, setSearchTopic] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [options, setOptions] = useState({
    examLevel: 'gcse',
    examBoard: '',
    difficulty: 'easy',
    questionCount: 10,
    englishExamType: '', // New field for English Language vs Literature
    historyUnit: '', // New field for History AQA units
    geographyUnit: '', // New field for Geography AQA units
    geographySection: '', // New field for Geography AQA unit sections
    biologyUnit: '', // New field for Biology AQA units
    chemistryUnit: '', // New field for Chemistry AQA units
    biologyEdexcelUnit: '', // New field for Biology Edexcel units
    physicsUnit: '' // New field for Physics AQA units
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [generatedSolutions, setGeneratedSolutions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSolutions, setIsGeneratingSolutions] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [alert, setAlert] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const loadingBarRef = useRef<{ complete: () => void } | null>(null);
  
  // Streak-related state
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    lastPracticeDate: null,
    hasGeneratedToday: false,
    shouldShowPopup: false
  });
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [newStreakCount, setNewStreakCount] = useState(0);
  const streakCounterRef = useRef<StreakCounterRef>(null);

  // Fetch user usage and streak data on component mount and when user changes
  useEffect(() => {
    if (user) {
      const fetchUsageAndStreak = async () => {
        try {
          // Fetch usage data
          const response = await fetch(API_CONFIG.ENDPOINTS.USAGE(user.id));
          if (response.ok) {
            const data = await response.json();
            setUsage(data);
            
            // Show pricing modal immediately if user hits their limit and is not premium
            if (!data.isPremium && data.usage >= data.limit) {
              setShowPricingModal(true);
            }
          }
          
          // Fetch streak data
          const streakResponse = await getUserStreak(user.id);
          if (streakResponse.success && streakResponse.data) {
            setStreakData(streakResponse.data);
          }
        } catch (error) {
          console.error('Error fetching usage and streak:', error);
        }
      };
      
      fetchUsageAndStreak();
    }
  }, [user, profile?.subscription_tier]); // Include profile tier to refresh usage when subscription changes

  // Reset exam level to GCSE if KS3 is selected but subject is not mathematics
  useEffect(() => {
    if (options.examLevel === 'ks3' && normalizedSubject !== 'mathematics') {
      setOptions(prev => ({ ...prev, examLevel: 'gcse', examBoard: '', englishExamType: '', historyUnit: '', geographyUnit: '', geographySection: '', biologyUnit: '', chemistryUnit: '', biologyEdexcelUnit: '', physicsUnit: '' }));
    }
  }, [normalizedSubject, options.examLevel]);

  // Subject themes and placeholder
  const subjectThemes: any = {
    mathematics: { bg: 'bg-blue-100', hover: 'hover:bg-blue-200', light: 'bg-blue-50' },
    physics: { bg: 'bg-purple-100', hover: 'hover:bg-purple-200', light: 'bg-purple-50' },
    chemistry: { bg: 'bg-green-100', hover: 'hover:bg-green-200', light: 'bg-green-50' },
    biology: { bg: 'bg-red-100', hover: 'hover:bg-red-200', light: 'bg-red-50' },
    english: { bg: 'bg-yellow-100', hover: 'hover:bg-yellow-200', light: 'bg-yellow-50' },
    history: { bg: 'bg-orange-100', hover: 'hover:bg-orange-200', light: 'bg-orange-50' },
    geography: { bg: 'bg-teal-100', hover: 'hover:bg-teal-200', light: 'bg-teal-50' },
    'religious studies': { bg: 'bg-indigo-100', hover: 'hover:bg-indigo-200', light: 'bg-indigo-50' },
    'physical education': { bg: 'bg-emerald-100', hover: 'hover:bg-emerald-200', light: 'bg-emerald-50' },
    'computer science': { bg: 'bg-cyan-100', hover: 'hover:bg-cyan-200', light: 'bg-cyan-50' },
    french: { bg: 'bg-rose-100', hover: 'hover:bg-rose-200', light: 'bg-rose-50' },
    spanish: { bg: 'bg-amber-100', hover: 'hover:bg-amber-200', light: 'bg-amber-50' }
  };
  const subjectTheme = subjectThemes[normalizedSubject] || subjectThemes['mathematics'];
  
  const subjectPlaceholders: any = {
    mathematics: 'e.g. quadratic equations, trigonometry, calculus, algebra, geometry...',
    'mathematics-ks3': 'e.g. prime numbers, fractions, basic algebra, area of shapes, sequences...',
    physics: 'e.g. forces, energy, electricity, waves, particles, motion...',
    chemistry: 'e.g. atomic structure, chemical bonding, acids and bases, organic chemistry...',
    biology: 'e.g. cell biology, microscopes, osmosis, photosynthesis, genetics...',
    english: 'e.g. Shakespeare, poetry analysis, creative writing, persuasive techniques...',
    'english-language': 'e.g. language analysis, creative writing, non-fiction texts, persuasive techniques...',
    'english-literature': 'e.g. Shakespeare, poetry analysis, character development, themes in novels...',
    history: 'e.g. World War 2, Medieval England, Industrial Revolution, Cold War...',
    geography: 'e.g. climate change, plate tectonics, rivers, population, urbanisation...',
    'religious studies': 'e.g. Christianity, Islam, ethics, philosophy, world religions...',
    'physical education': 'e.g. fitness training, sports psychology, anatomy, health and diet...',
    'computer science': 'e.g. algorithms, programming, databases, networks, cybersecurity...',
    french: 'e.g. family and relationships, school life, hobbies, travel, food...',
    spanish: 'e.g. family and relationships, school life, hobbies, travel, food...'
  };
  
  // Get dynamic placeholder based on subject and unit selection
  const getDynamicPlaceholder = (): string => {
    let placeholderKey = normalizedSubject;
    
    if (normalizedSubject === 'mathematics' && options.examLevel === 'ks3') {
      placeholderKey = 'mathematics-ks3';
    } else if (normalizedSubject === 'english' && options.englishExamType) {
      placeholderKey = options.englishExamType;
    } else if (normalizedSubject === 'biology' && options.examLevel === 'gcse' && options.examBoard === 'aqa' && options.biologyUnit) {
      // Get first few topics from the selected biology unit for the placeholder
      const unitTopics = biologyGcseAqaUnits[options.biologyUnit];
      if (unitTopics && unitTopics.length > 0) {
        // Take fewer topics if they're long (like practicals), more if they're short
        const averageLength = unitTopics.slice(0, 4).reduce((sum, topic) => sum + topic.length, 0) / Math.min(4, unitTopics.length);
        const numTopics = averageLength > 50 ? 2 : averageLength > 30 ? 3 : 4;
        
        let sampleTopics = unitTopics.slice(0, numTopics).join(', ');
        
        // Truncate if still too long
        if (sampleTopics.length > 80) {
          sampleTopics = sampleTopics.substring(0, 77) + '...';
        }
        
        return `e.g. ${sampleTopics}...`;
      }
    } else if (normalizedSubject === 'biology' && options.examLevel === 'gcse' && options.examBoard === 'edexcel' && options.biologyEdexcelUnit) {
      const unitTopics = biologyGcseEdexcelUnits[options.biologyEdexcelUnit];
      if (unitTopics && unitTopics.length > 0) {
        const averageLength = unitTopics.slice(0, 4).reduce((sum, topic) => sum + topic.length, 0) / Math.min(4, unitTopics.length);
        const numTopics = averageLength > 50 ? 2 : averageLength > 30 ? 3 : 4;
        
        let sampleTopics = unitTopics.slice(0, numTopics).join(', ');
        
        if (sampleTopics.length > 80) {
          sampleTopics = sampleTopics.substring(0, 77) + '...';
        }
        
        return `e.g. ${sampleTopics}...`;
      }
    } else if (normalizedSubject === 'chemistry' && options.examLevel === 'gcse' && options.examBoard === 'aqa' && options.chemistryUnit) {
      const unitTopics = chemistryGcseAqaUnits[options.chemistryUnit];
      if (unitTopics && unitTopics.length > 0) {
        const averageLength = unitTopics.slice(0, 4).reduce((sum, topic) => sum + topic.length, 0) / Math.min(4, unitTopics.length);
        const numTopics = averageLength > 50 ? 2 : averageLength > 30 ? 3 : 4;
        
        let sampleTopics = unitTopics.slice(0, numTopics).join(', ');
        
        if (sampleTopics.length > 80) {
          sampleTopics = sampleTopics.substring(0, 77) + '...';
        }
        
        return `e.g. ${sampleTopics}...`;
      }
    } else if (normalizedSubject === 'physics' && options.examLevel === 'gcse' && options.examBoard === 'aqa' && options.physicsUnit) {
      const unitTopics = physicsGcseAqaUnits[options.physicsUnit];
      if (unitTopics && unitTopics.length > 0) {
        const averageLength = unitTopics.slice(0, 4).reduce((sum, topic) => sum + topic.length, 0) / Math.min(4, unitTopics.length);
        const numTopics = averageLength > 50 ? 2 : averageLength > 30 ? 3 : 4;
        
        let sampleTopics = unitTopics.slice(0, numTopics).join(', ');
        
        if (sampleTopics.length > 80) {
          sampleTopics = sampleTopics.substring(0, 77) + '...';
        }
        
        return `e.g. ${sampleTopics}...`;
      }
      // Fallback if no topics are available yet
      return `e.g. Enter physics topics for ${options.physicsUnit}...`;
    }
    
    return subjectPlaceholders[placeholderKey] || 'Enter a topic...';
  };

  const placeholder = getDynamicPlaceholder();

  // Clean question string to format values
  const cleanQuestion = (question: string) => {
    if (!question) return question;
    
    // First, normalize whitespace and remove formatting artifacts
    let processedQuestion = question
    .replace(/```/g, '') // Remove markdown code blocks
    .replace(/\u00A0/g, ' ') // Replace non-breaking spaces
    .replace(/[^\S\r\n]+/g, ' ') // Replace all other weird spaces
    .normalize('NFKC') // Convert full-width/monospace chars to normal
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
    
    // Then, convert mathematical operators to proper symbols
    
    // For mathematics subject, replace sqrt with square root symbol
    if (normalizedSubject === 'mathematics') {
      processedQuestion = processedQuestion.replace(/sqrt/g, '√');
    }
    
    processedQuestion = processedQuestion.replace(/\s*\*\s*/g, ' × '); // Convert * to × (multiplication with spaces)
    processedQuestion = processedQuestion.replace(/\+\-/g, '±'); // Convert +- to ±
    processedQuestion = processedQuestion.replace(/\+-/g, '±'); // Convert +- to ±
    processedQuestion = processedQuestion.replace(/\s+\/\s+/g, ' ÷ '); // Convert / to ÷ (division with spaces)
    processedQuestion = processedQuestion.replace(/\s*<=\s*/g, ' ≤ '); // Convert <= to ≤
    processedQuestion = processedQuestion.replace(/\s*>=\s*/g, ' ≥ '); // Convert >= to ≥
    processedQuestion = processedQuestion.replace(/\s*!=\s*/g, ' ≠ '); // Convert != to ≠
    processedQuestion = processedQuestion.replace(/\s*~=\s*/g, ' ≈ '); // Convert ~= to ≈
    
    const questionChars = [];
    let isCurrentSuperscript = false // If the current character is a superscript
    let isCurrentSubscript = false // If the current character is a subscript
    let prevStr = "" // Previous character
    for (const char of processedQuestion) {
      // Handle superscript
      if (char === "^") {
        isCurrentSuperscript = true // Set current character to superscript
        continue
      }
      else if(isCurrentSuperscript) {
        if (!isNaN(Number(char))) {
          questionChars.push(<sup key={questionChars.length}>{char}</sup>) // Display character as a superscript
          continue;
        }
                    
        isCurrentSuperscript = false
      }

      // Handle subscript
      if (char === "_") {
        isCurrentSubscript = true // Set current character to subscript
        continue
      }
      else if(isCurrentSubscript) {
        if (!isNaN(Number(char))) {
          questionChars.push(<sub key={questionChars.length}>{char}</sub>) // Display character as a subscript
          continue;
        }
                    
        isCurrentSubscript = false
      }

      // Handle right arrow
      if (char === "-") {
        prevStr = char
        continue
      }
      else if (prevStr === "-") {
        if (char === ">") {
          questionChars.push(<span key={questionChars.length}>&rarr;</span>)
          prevStr = ""
          continue
        }
        else questionChars.push(prevStr)
      }
      questionChars.push(char)
      prevStr = ""
    }
    
    return <>{questionChars.map((char, index) => <span key={index}>{char}</span>)}</>
  };

  // Function to convert mathematical notation to proper Unicode symbols for PDF
  const formatMathForPDF = (text: string): string => {
    if (!text) return text;
    
    // First, normalize whitespace and remove formatting artifacts
    let result = text
      .replace(/```/g, '') // Remove markdown code blocks
      .replace(/\u00A0/g, ' ') // Replace non-breaking spaces with regular spaces
      .replace(/\s+/g, ' ') // Normalize multiple whitespace to single space
      .trim(); // Remove leading/trailing whitespace
    
    // Note: Keep sqrt as "sqrt" in PDF for better compatibility - don't convert to √ symbol
    
    // Convert superscripts to Unicode superscript symbols
    const superscriptMap: { [key: string]: string } = {
      '0': '⁰',
      '1': '¹',
      '2': '²',
      '3': '³',
      '4': '⁴',
      '5': '⁵',
      '6': '⁶',
      '7': '⁷',
      '8': '⁸',
      '9': '⁹',
      '+': '⁺',
      '-': '⁻',
      '=': '⁼',
      '(': '⁽',
      ')': '⁾',
      'n': 'ⁿ'
    };
    
    // Convert subscripts to Unicode subscript symbols
    const subscriptMap: { [key: string]: string } = {
      '0': '₀',
      '1': '₁',
      '2': '₂',
      '3': '₃',
      '4': '₄',
      '5': '₅',
      '6': '₆',
      '7': '₇',
      '8': '₈',
      '9': '₉',
      '+': '₊',
      '-': '₋',
      '=': '₌',
      '(': '₍',
      ')': '₎'
    };
    
    // Handle superscripts: convert x^2 to x²
    result = result.replace(/\^([0-9+\-=()n]+)/g, (_, chars) => {
      return chars.split('').map((char: string) => superscriptMap[char] || char).join('');
    });
    
    // Handle subscripts: convert H_2 to H₂
    result = result.replace(/_([0-9+\-=()]+)/g, (_, chars) => {
      return chars.split('').map((char: string) => subscriptMap[char] || char).join('');
    });
    
    // Handle arrows: convert -> to →
    result = result.replace(/->/g, '→');
    
    // Handle mathematical operators
    result = result.replace(/\* /g, '× '); // Convert * to × (multiplication)
    result = result.replace(/ \* /g, ' × '); // Convert * to × (multiplication with spaces)
    result = result.replace(/\s*\*\s*/g, ' × '); // Convert * to × (multiplication with variable spaces)
    result = result.replace(/\+\-/g, '±'); // Convert +- to ±
    result = result.replace(/\+-/g, '±'); // Convert +- to ±
    result = result.replace(/\s+\/\s+/g, ' ÷ '); // Convert / to ÷ (division with spaces)
    result = result.replace(/\s*<=\s*/g, ' ≤ '); // Convert <= to ≤
    result = result.replace(/\s*>=\s*/g, ' ≥ '); // Convert >= to ≥
    result = result.replace(/\s*!=\s*/g, ' ≠ '); // Convert != to ≠
    result = result.replace(/\s*~=\s*/g, ' ≈ '); // Convert ~= to ≈
    
    return result;
  };

  // Fetch questions from backend
  const generateQuestions = async () => {
    if (!user) return;

    setIsGenerating(true);
    setIsCancelled(false);
    setAlert(null);
    
    // Validate topic is entered
    if (!searchTopic.trim()) {
      setAlert({ type: 'error', message: 'Please enter a topic' });
      setIsGenerating(false);
      return;
    }
    
    // Validate exam board for GCSE
    if (options.examLevel === 'gcse' && !options.examBoard) {
      setAlert({ type: 'error', message: 'Please choose an exam board' });
      setIsGenerating(false);
      return;
    }

    // Validate English exam type for English + GCSE
    if (normalizedSubject === 'english' && options.examLevel === 'gcse' && !options.englishExamType) {
      setAlert({ type: 'error', message: 'Please choose between English Language and English Literature' });
      setIsGenerating(false);
      return;
    }

    // Check for History unit selection
    if (normalizedSubject === 'history' && options.examBoard === 'aqa' && options.examLevel === 'gcse' && !options.historyUnit) {
      setAlert({ type: 'error', message: 'Please choose a History unit' });
      setIsGenerating(false);
      return;
    }

    // Check for Biology unit selection
    if (normalizedSubject === 'biology' && options.examBoard === 'aqa' && options.examLevel === 'gcse' && !options.biologyUnit) {
      setAlert({ type: 'error', message: 'Please choose a Biology unit' });
      setIsGenerating(false);
      return;
    }

    // Check for Biology Edexcel unit selection
    if (normalizedSubject === 'biology' && options.examBoard === 'edexcel' && options.examLevel === 'gcse' && !options.biologyEdexcelUnit) {
      setAlert({ type: 'error', message: 'Please choose a Biology unit' });
      setIsGenerating(false);
      return;
    }

    // Check for Chemistry unit selection
    if (normalizedSubject === 'chemistry' && options.examBoard === 'aqa' && options.examLevel === 'gcse' && !options.chemistryUnit) {
      setAlert({ type: 'error', message: 'Please choose a Chemistry unit' });
      setIsGenerating(false);
      return;
    }

    // Check for Physics unit selection
    if (normalizedSubject === 'physics' && options.examBoard === 'aqa' && options.examLevel === 'gcse' && !options.physicsUnit) {
      setAlert({ type: 'error', message: 'Please choose a Physics unit' });
      setIsGenerating(false);
      return;
    }

    // Create AbortController for cancellation
    const abortController = new AbortController();

    try {
      // Determine the correct subject to send to backend
      let subjectToSend = normalizedSubject;
      if (normalizedSubject === 'english' && options.englishExamType) {
        subjectToSend = options.englishExamType; // 'english-language' or 'english-literature'
      }

      const response = await fetch(API_CONFIG.ENDPOINTS.GENERATE_QUESTIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: subjectToSend,
          topic: searchTopic,
          examLevel: options.examLevel,
          examBoard: options.examBoard,
          difficulty: options.difficulty,
          numQuestions: options.questionCount,
          userId: user.id,
          historyUnit: options.historyUnit, // Include history unit for AQA History
          geographyUnit: options.geographyUnit, // Include geography unit for AQA Geography
          geographySection: options.geographySection, // Include geography section for AQA Geography
          biologyUnit: options.biologyUnit, // Include biology unit for AQA Biology
          chemistryUnit: options.chemistryUnit, // Include chemistry unit for AQA Chemistry
          biologyEdexcelUnit: options.biologyEdexcelUnit, // Include biology unit for Edexcel Biology
          physicsUnit: options.physicsUnit // Include physics unit for AQA Physics
        }),
        signal: abortController.signal
      });

      // Check if request was cancelled
      if (abortController.signal.aborted) {
        return;
      }

      if (response.status === 429) {
        // Handle usage limit exceeded - show pricing modal instead of alert
        const errorData = await response.json();
        if (!errorData.isPremium) {
          setShowPricingModal(true);
        } else {
          setAlert({ 
            type: 'error', 
            message: errorData.error,
            isUsageLimit: true,
            usage: errorData.usage,
            limit: errorData.limit,
            isPremium: errorData.isPremium
          });
        }
        setIsGenerating(false);
        return;
      }

      if (!response.ok) throw new Error('Failed to generate questions');
      
      const data = await response.json();
      
      // Check if cancelled before setting data
      if (!isCancelled) {
        setGeneratedQuestions(data);
        
        // Complete the loading bar
        if (loadingBarRef.current) {
          loadingBarRef.current.complete();
        }
        
        // Track successful question generation
        trackQuestionGeneration(normalizedSubject, searchTopic, data.length, options.difficulty);
        
        // Track subject-specific question generation for popularity analysis
        // trackSubjectQuestionGeneration(normalizedSubject, searchTopic, data.length, options.difficulty, options.examLevel, options.examBoard); // This line was removed from imports
        
        // Handle streak logic - check if this is their first generation of the day
        if (user && !streakData.hasGeneratedToday) {
          try {
            const streakResponse = await updateStreakOnGeneration(user.id);
            
            if (streakResponse.success && streakResponse.data) {
              const newStreak = streakResponse.data.currentStreak;
              setNewStreakCount(newStreak);
              setShowStreakPopup(true);
              
              // Update streak data
              setStreakData(streakResponse.data);
              
              // Refresh the streak counter in the header
              if (streakCounterRef.current) {
                await streakCounterRef.current.refresh();
              }
            }
          } catch (error) {
            console.error('Error updating streak:', error);
          }
        }
        
        // Refresh usage after generating questions
        if (user) {
          const response = await fetch(API_CONFIG.ENDPOINTS.USAGE(user.id));
          if (response.ok) {
            const data = await response.json();
            setUsage(data);
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was cancelled - don't show error
        return;
      }
      setAlert({ type: 'error', message: error.message || 'Error generating questions' });
      // Track generation errors
      trackError('question_generation', error.message || 'Unknown error', 'QuestionGenerator');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle cancellation
  const handleCancelGeneration = () => {
    setIsCancelled(true);
    setIsGenerating(false);
  };

  // Replace the existing generateSolutions function with this:
  const generateSolutions = async () => {
    if (!generatedQuestions.length || !user) return;

    setIsGeneratingSolutions(true);
    setAlert(null);
    
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.GENERATE_SOLUTIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: generatedQuestions,
          userId: user.id
        }),
      });

      if (!response.ok) throw new Error('Failed to generate solutions');

      const data = await response.json();

      // Process the answers to ensure they are strings
      const processedQuestions = data.map((question: any) => {
        if (typeof question.answer === 'object' && question.answer !== null) {
          // Convert to bullet points like in browser
          question.answer = Object.entries(question.answer).map(([, value]) => 
            `• ${value}`
          ).join('\n');
        }
        return question;
      });

      setGeneratedSolutions(processedQuestions);
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Error generating solutions' });
    } finally {
      setIsGeneratingSolutions(false);
    }
  };

  // New function to handle show/hide solutions with automatic generation
  const handleShowSolutions = async () => {
    if (showSolutions) {
      // If solutions are currently shown, just hide them
      setShowSolutions(false);
    } else {
      // If solutions are not shown, generate them if needed and then show them
      if (generatedSolutions.length === 0) {
        await generateSolutions();
      }
      setShowSolutions(true);
    }
  };

  // Shared PDF generation logic
  const generatePDFContent = (includeSolutions: boolean) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    
    // Configuration for both grid and lined subjects
    const lineSpacing = 8; // Distance between lines for lined subjects
    const gridSpacing = 5; // Distance between grid lines for mathematics
    const firstLineY = 30; // Y position of first line/grid reference
    const leftMargin = 20;
    const rightMargin = 20;
    const lineLength = pageWidth - leftMargin - rightMargin;
    
    // Calculate positions for text alignment
    const getNextLinePosition = (currentY: number) => {
      if (normalizedSubject === 'mathematics') {
        // For grid subjects, align to grid positions (every 5px)
        const gridNumber = Math.ceil((currentY - firstLineY) / gridSpacing);
        return firstLineY + (gridNumber * gridSpacing);
      } else {
        // For lined subjects, align to line positions (every 8px)
        const lineNumber = Math.ceil((currentY - firstLineY) / lineSpacing);
        return firstLineY + (lineNumber * lineSpacing);
      }
    };
    
    let yPosition = firstLineY; // Start at first line/grid position

    // Function to add background pattern
    const addBackgroundPattern = () => {
      doc.setDrawColor(220, 220, 220); // Light gray color
      doc.setLineWidth(0.1);

      if (normalizedSubject === 'mathematics') {
        // Add grid pattern for mathematics
        const gridSize = 5;
        // Vertical lines
        for (let x = 0; x <= pageWidth; x += gridSize) {
          doc.line(x, 0, x, pageHeight);
        }
        // Horizontal lines
        for (let y = 0; y <= pageHeight; y += gridSize) {
          doc.line(0, y, pageWidth, y);
        }
      } else {
        // Add lined pattern for other subjects
        for (let y = firstLineY; y <= pageHeight - 20; y += lineSpacing) {
          doc.line(leftMargin, y, pageWidth - rightMargin, y);
        }
      }
    };

    // Function to add logo to top right corner
    const addLogoToPage = () => {
      try {
        // Add "Practice Qs" logo to top right corner matching the SVG design
        doc.setFont('times', 'normal'); // Using Times as closest approximation to Georgia
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        
        // Position "Practice" centered at top right
        const practiceText = 'Practice';
        const qsText = 'Qs';
        const practiceWidth = doc.getTextWidth(practiceText);
        const qsWidth = doc.getTextWidth(qsText);
        
        // Position Practice
        const practiceX = pageWidth - 20 - (practiceWidth / 2);
        doc.text(practiceText, practiceX, 12);
        
        // Position Qs centered underneath Practice  
        const qsX = pageWidth - 20 - (qsWidth / 2);
        doc.text(qsText, qsX, 22); // Reduced gap to 10px
        
        doc.setFont('helvetica', 'normal'); // Reset to default font
        doc.setTextColor(0, 0, 0); // Reset to black
      } catch (error) {
        console.log('Could not add logo to PDF');
      }
    };

    // Add background pattern and logo to first page
    addBackgroundPattern();
    addLogoToPage();

    // Add title - positioned consistently for both subjects
    if (normalizedSubject === 'mathematics') {
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      const titleText = formatMathForPDF(searchTopic);
      // Calculate available width for title (leave space for logo in top right)
      const logoReservedWidth = 50; // Reserve space for "Practice Qs" logo
      const titleMaxWidth = lineLength - logoReservedWidth;
      const titleLines = doc.splitTextToSize(titleText, titleMaxWidth);
      let titleY = 12; // Start at same level as logo
      titleLines.forEach((line: string) => {
        doc.text(line, leftMargin, titleY);
        titleY += 8; // Line spacing for title
      });
      doc.setFont('helvetica', 'normal');
      yPosition = getNextLinePosition(firstLineY + gridSpacing * 3); // Reduced gap to questions
    } else {
      // For lined subjects, align with lines
      doc.setFontSize(18); // Bigger font size
      doc.setFont('helvetica', 'bold');
      const titleText = formatMathForPDF(searchTopic);
      // Calculate available width for title (leave space for logo in top right)
      const logoReservedWidth = 50; // Reserve space for "Practice Qs" logo
      const titleMaxWidth = lineLength - logoReservedWidth;
      const titleLines = doc.splitTextToSize(titleText, titleMaxWidth);
      let titleY = 12; // Start at same level as logo
      titleLines.forEach((line: string) => {
        doc.text(line, leftMargin, titleY);
        titleY += 7; // Line spacing for title
      });
      doc.setFont('helvetica', 'normal');
      yPosition = getNextLinePosition(firstLineY + lineSpacing * 0.5); // Reduced gap to questions
    }

    // Add questions
    generatedQuestions.forEach((question, index) => {
      // Check if we need a new page (leave space for at least 6 lines/grid units)
      const spacingUnit = normalizedSubject === 'mathematics' ? gridSpacing : lineSpacing;
      if (yPosition > pageHeight - (spacingUnit * 6)) {
        doc.addPage();
        addBackgroundPattern(); // Add pattern to new page
        addLogoToPage(); // Add logo to new page
        yPosition = firstLineY;
      }

      // Question header - align with grid/lines
      doc.setFontSize(11); // Consistent font size for headers
      doc.setFont('helvetica', 'bold');
      let questionHeader = `Question ${index + 1}`;
      if (question.marks) {
        questionHeader += ` [${question.marks} marks]`;
      }
      doc.text(questionHeader, leftMargin, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition = getNextLinePosition(yPosition + spacingUnit);

      // Question text - align with grid/lines with proper mathematical formatting
      doc.setFontSize(10); // Consistent font size for question text
      const formattedQuestion = formatMathForPDF(question.question);
      const questionLines = doc.splitTextToSize(formattedQuestion, lineLength);
      
      // Place each line on grid/lines
      questionLines.forEach((line: string) => {
        doc.text(line, leftMargin, yPosition);
        yPosition = getNextLinePosition(yPosition + spacingUnit);
      });
      // Add extra space for writing (only if not including solutions)
      if (!includeSolutions) {
        yPosition = getNextLinePosition(yPosition + spacingUnit * 3);
      }

      // Display passage if it exists (for questions with passages)
      if (question.passage) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Extract:', leftMargin, yPosition);
        doc.setFont('helvetica', 'normal');
        yPosition = getNextLinePosition(yPosition + spacingUnit);
        
        doc.setFontSize(8); // Smaller font for passages
        const formattedPassage = formatMathForPDF(question.passage);
        const passageLines = doc.splitTextToSize(formattedPassage, lineLength);
        passageLines.forEach((line: string) => {
          doc.text(line, leftMargin, yPosition);
          yPosition = getNextLinePosition(yPosition + spacingUnit);
        });
        // Add spacing after passage (only if not including solutions)
        if (!includeSolutions) {
          yPosition = getNextLinePosition(yPosition + spacingUnit);
        }
      }

      // Add solutions if includeSolutions is true and answer exists
      if (includeSolutions && question.answer) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Answer:', leftMargin, yPosition);
        doc.setFont('helvetica', 'normal');
        yPosition = getNextLinePosition(yPosition + spacingUnit);

        doc.setFontSize(9);
        
        // Format answer exactly like the browser display with bullet points
        let answerText = '';
        if (typeof question.answer === 'object' && question.answer !== null) {
          // Convert to bullet points like in browser
          answerText = Object.entries(question.answer).map(([, value]) => 
            `• ${value}`
          ).join('\n');
        } else {
          answerText = String(question.answer);
        }
        
        const formattedAnswer = formatMathForPDF(answerText);
        const answerLines = doc.splitTextToSize(formattedAnswer, lineLength);
        answerLines.forEach((line: string) => {
          doc.text(line, leftMargin, yPosition);
          yPosition = getNextLinePosition(yPosition + spacingUnit);
        });
        yPosition = getNextLinePosition(yPosition + spacingUnit * 2);
      } else {
        // Add extra space for writing answers
        yPosition = getNextLinePosition(yPosition + spacingUnit * 3);
      }
    });

    return doc;
  };

  // Export PDF with questions only
  const exportToPDFQuestionsOnly = () => {
    const doc = generatePDFContent(false);
    const fileName = `${normalizedSubject}-${searchTopic.replace(/\s+/g, '-')}-questions.pdf`;
    doc.save(fileName);
    
    // Track PDF export
    trackPDFExport(normalizedSubject, searchTopic, generatedQuestions.length);
  };

  // Export PDF with solutions included
  const exportToPDFWithSolutions = () => {
    const doc = generatePDFContent(true);
    const fileName = `${normalizedSubject}-${searchTopic.replace(/\s+/g, '-')}-questions-with-solutions.pdf`;
    doc.save(fileName);
    
    // Track PDF export
    trackPDFExport(normalizedSubject, searchTopic, generatedQuestions.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateQuestions();
  };

  const resetForm = () => {
    setSearchTopic('');
    setGeneratedQuestions([]);
    setGeneratedSolutions([]);
    setShowSolutions(false);
    setIsGenerating(false);
    setIsCancelled(false);
    setOptions(prev => ({ ...prev, historyUnit: '', geographyUnit: '', geographySection: '', biologyUnit: '', chemistryUnit: '', biologyEdexcelUnit: '', physicsUnit: '' }));
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.CREATE_PORTAL_SESSION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          returnUrl: window.location.origin + '/generator/' + subject
        })
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const errorData = await response.json();
        console.error('Portal session error:', errorData);
        alert(`Failed to create portal session: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      alert('Network error creating portal session');
    }
  };

  // Handle topic selection from dropdown
  const handleTopicSelect = (topic: string) => {
    setSearchTopic(topic);
    setShowDropdown(false);
  };

  // Handle input change and show dropdown
  const handleTopicInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTopic(value);
    setShowDropdown(value.trim().length > 0);
  };

  // Handle input focus to show dropdown
  const handleTopicInputFocus = () => {
    if (searchTopic.trim().length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Logo in top left corner - responsive sizing */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
        <button
          onClick={() => navigate('/home')}
          className="cursor-pointer hover:opacity-75 transition-opacity focus:outline-none border-none focus:ring-0 focus:border-none"
        >
          <img 
            src="/logo.svg" 
            alt="Logo" 
            className="h-12 w-auto sm:h-16 lg:h-24"
          />
        </button>
      </div>
      
      <div className="max-w-3xl mx-auto pt-16 sm:pt-20 lg:pt-0">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 capitalize">
            {normalizedSubject} Practice Questions
          </h1>
          <div className="flex items-center gap-0">
            {/* Streak Counter - directly attached to buttons */}
            <StreakCounter 
              ref={streakCounterRef}
              onStreakUpdate={setStreakData}
            />
            <div className="flex gap-1 sm:gap-2 ml-2">
            {/* Upgrade button - only show for non-premium users */}
            {profile && profile.subscription_tier === 'free' && (
              <button
                onClick={() => {
                  trackSubscription('upgrade_clicked');
                  trackButtonClick('Upgrade', 'QuestionGenerator');
                  setShowPricingModal(true);
                }}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors duration-200 shadow-sm"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium">Upgrade</span>
              </button>
            )}

            {/* Manage Subscription button - only show for premium users */}
            {profile && profile.subscription_tier === 'premium' && (
              <button
                onClick={handleManageSubscription}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors duration-200 shadow-sm"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">Manage Subscription</span>
                <span className="text-xs sm:text-sm font-medium sm:hidden">Manage</span>
              </button>
            )}
            
            {/* Home Button */}
              <button
                onClick={() => navigate('/home')}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors duration-200 shadow-sm"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-xs sm:text-sm font-medium">Home</span>
              </button>
            </div>
          </div>
        </div>

        {alert && (
          <div className={`mb-4 p-4 rounded-md ${
            alert.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <div className="text-sm text-red-700 dark:text-red-200">{alert.message}</div>
            {alert.isUsageLimit && (
              <div className="mt-2 text-sm">
                <p>Current usage: {alert.usage}/{alert.limit === 'unlimited' ? '∞' : alert.limit} questions today</p>
                {!alert.isPremium && (
                  <p className="mt-1 text-blue-600">
                    <strong>Upgrade to premium for unlimited questions!</strong>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

{/* Enhanced Debugging - check console */}
{usage && console.log('=== USAGE DEBUG START ===')}
{usage && console.log('Usage object:', JSON.stringify(usage, null, 2))}
{usage && console.log('isPremium value:', usage?.isPremium)}
{usage && console.log('isPremium type:', typeof usage?.isPremium)}
{usage && console.log('isPremium === false:', usage?.isPremium === false)}
{usage && console.log('isPremium == false:', usage?.isPremium == false)}
{usage && console.log('!usage.isPremium:', !usage?.isPremium)}
{usage && console.log('Condition (usage && !usage.isPremium):', usage && !usage?.isPremium)}
{usage && console.log('=== USAGE DEBUG END ===')}


{/* Usage Counter */}
{usage && !usage.isPremium && (
  <div className="z-20 relative mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
          Daily Usage
        </h3>
        <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
          {(() => {
            // Handle invalid data from database errors
            const currentUsage = isNaN(usage?.usage) ? 15 : usage.usage;
            const currentLimit =
              usage?.limit === 'unlimited'
                ? '∞'
                : isNaN(usage?.limit)
                ? 15
                : usage.limit;
            return `${currentUsage}/${currentLimit} questions`;
          })()}
        </p>
      </div>
      <div className="text-right">
        <button
          onClick={() => {
            trackSubscription('upgrade_clicked');
            trackButtonClick('Upgrade to Premium', 'UsageCounter');
            setShowPricingModal(true);
          }}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
        >
          Upgrade to Premium
        </button>
      </div>
    </div>

    <div className="mt-2">
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{
            width: `${Math.min(
              ((usage?.usage || 0) / (usage?.limit || 1)) * 100,
              100
            )}%`,
          }}
        ></div>
      </div>
      <div className="flex justify-between items-center mt-1">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {(() => {
            const remaining = (usage?.limit || 0) - (usage?.usage || 0);
            if (isNaN(remaining) || remaining <= 0) {
              return "Zero questions remaining today. Upgrade now to unlock unlimited questions, or come back tomorrow.";
            }
            return `${remaining} questions remaining today`;
          })()}
        </p>
      </div>
    </div>
  </div>
)}


        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Options */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <label htmlFor="examLevel" className="block text-base font-semibold text-gray-800 mb-2">
                Exam Level
              </label>
              <select
                id="examLevel"
                value={options.examLevel}
                onChange={(e) => setOptions({ ...options, examLevel: e.target.value, examBoard: '', englishExamType: '', historyUnit: '', geographyUnit: '', geographySection: '', biologyUnit: '', chemistryUnit: '', biologyEdexcelUnit: '', physicsUnit: '' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="gcse">GCSE</option>
                <option value="ks3" disabled={normalizedSubject !== 'mathematics'}>
                  {normalizedSubject === 'mathematics' ? 'KS3' : 'KS3 (Coming Soon)'}
                </option>
                <option value="alevel" disabled>A Level (Coming Soon)</option>
              </select>
            </div>

            {/* English Exam Type Selection - only for English + GCSE */}
            {normalizedSubject === 'english' && options.examLevel === 'gcse' && (
              <div>
                <label htmlFor="englishExamType" className="block text-base font-semibold text-gray-800 mb-2">
                  English Exam
                </label>
                <select
                  id="englishExamType"
                  value={options.englishExamType}
                  onChange={(e) => setOptions({ ...options, englishExamType: e.target.value, examBoard: '', historyUnit: '', geographyUnit: '', geographySection: '', biologyUnit: '', chemistryUnit: '', biologyEdexcelUnit: '', physicsUnit: '' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Choose English exam type</option>
                  <option value="english-language">English Language</option>
                  <option value="english-literature">English Literature</option>
                </select>
              </div>
            )}

            {/* Exam Board Selection - for GCSE, and for English only after exam type is selected */}
            {options.examLevel === 'gcse' && (
              (normalizedSubject !== 'english' || options.englishExamType) && (
                <div>
                  <label htmlFor="examBoard" className="block text-base font-semibold text-gray-800 mb-2">
                    Exam Board
                  </label>
                  <select
                    id="examBoard"
                    value={options.examBoard}
                    onChange={(e) => setOptions({ ...options, examBoard: e.target.value, historyUnit: '', geographyUnit: '', geographySection: '', biologyUnit: '', chemistryUnit: '', biologyEdexcelUnit: '', physicsUnit: '' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select an exam board</option>
                    <option value="aqa">AQA</option>
                    <option value="edexcel">Edexcel</option>
                    {(normalizedSubject === 'mathematics' || normalizedSubject === 'physics' || normalizedSubject === 'chemistry') && (
                      <option value="ocr">
                        {(normalizedSubject === 'chemistry' || normalizedSubject === 'physics') ? 'OCR A' : 'OCR'}
                      </option>
                    )}
                    {normalizedSubject === 'mathematics' && (
                      <option value="ci">Cambridge (IGCSE)</option>
                    )}
                  </select>
                </div>
              )
            )}

            {/* History Unit Selection - only for AQA GCSE History */}
            {normalizedSubject === 'history' && options.examBoard === 'aqa' && (
              <div className="sm:col-span-3">
                <label htmlFor="historyUnit" className="block text-base font-semibold text-gray-800 mb-2">
                  History Unit
                </label>
                <select
                  id="historyUnit"
                  value={options.historyUnit}
                  onChange={(e) => setOptions({ ...options, historyUnit: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a History unit</option>
                  <option value="america-1840-1895">America, 1840-1895: Expansion and consolidation</option>
                  <option value="germany-1890-1945">Germany, 1890-1945: Democracy and dictatorship</option>
                  <option value="russia-1894-1945">Russia, 1894-1945: Tsardom and communism</option>
                  <option value="america-1920-1973">America, 1920-1973: Opportunity and inequality</option>
                  <option value="conflict-first-world-war">Conflict and tension: The First World War, 1894–1918</option>
                  <option value="conflict-inter-war">Conflict and tension: The inter-war years, 1918–1939</option>
                  <option value="conflict-east-west">Conflict and tension between East and West, 1945–1972</option>
                  <option value="conflict-asia">Conflict and tension in Asia, 1950–1975</option>
                  <option value="conflict-gulf-afghanistan">Conflict and tension in the Gulf and Afghanistan, 1990–2009</option>
                  <option value="britain-health">Britain: Health and the people: c1000 to the present day</option>
                  <option value="britain-power">Britain: Power and the people: c1170 to the present day</option>
                  <option value="britain-migration">Britain: Migration, empires and the people: c790 to the present day</option>
                  <option value="norman-england">Norman England, c1066–c1100</option>
                  <option value="medieval-england">Medieval England: the reign of Edward I, 1272–1307</option>
                  <option value="elizabethan-england">Elizabethan England, c1568–1603</option>
                  <option value="restoration-england">Restoration England, 1660–1685</option>
                </select>
              </div>
            )}

            {/* Geography Unit Selection - only for AQA GCSE Geography */}
            {normalizedSubject === 'geography' && options.examBoard === 'aqa' && (
              <div className="sm:col-span-3">
                <label htmlFor="geographyUnit" className="block text-base font-semibold text-gray-800 mb-2">
                  Geography Unit
                </label>
                <select
                  id="geographyUnit"
                  value={options.geographyUnit}
                  onChange={(e) => setOptions({ ...options, geographyUnit: e.target.value, geographySection: '', biologyUnit: '', chemistryUnit: '', biologyEdexcelUnit: '', physicsUnit: '' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a Geography unit</option>
                  <option value="living-physical-environment">Living with the physical environment</option>
                  <option value="human-environment-challenges">Challenges in the human environment</option>
                  <option value="geographical-applications-fieldwork">Geographical applications (Fieldwork)</option>
                  <option value="geographical-skills">Geographical skills</option>
                </select>
              </div>
            )}

            {/* Geography Section Selection - only for AQA GCSE Geography with unit selected (except geographical-skills) */}
            {normalizedSubject === 'geography' && options.examBoard === 'aqa' && options.geographyUnit && options.geographyUnit !== 'geographical-skills' && (
              <div className="sm:col-span-3">
                <label htmlFor="geographySection" className="block text-base font-semibold text-gray-800 mb-2">
                  Geography Section
                </label>
                <select
                  id="geographySection"
                  value={options.geographySection}
                  onChange={(e) => setOptions({ ...options, geographySection: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a Geography section</option>
                  {options.geographyUnit === 'living-physical-environment' && (
                    <>
                      <option value="challenge-natural-hazards">The Challenge of Natural Hazards</option>
                      <option value="living-world">The Living World</option>
                      <option value="physical-landscapes-uk">Physical Landscapes in the UK</option>
                    </>
                  )}
                  {options.geographyUnit === 'human-environment-challenges' && (
                    <>
                      <option value="urban-issues-challenges">Urban Issues and Challenges</option>
                      <option value="changing-economic-world">The Changing Economic World</option>
                      <option value="challenge-resource-management">The Challenge of Resource Management</option>
                    </>
                  )}
                  {options.geographyUnit === 'geographical-applications-fieldwork' && (
                    <>
                      <option value="issue-evaluation">Issue Evaluation</option>
                      <option value="fieldwork">Fieldwork</option>
                    </>
                  )}
                </select>
              </div>
            )}

            {/* Biology Unit Selection - only for AQA GCSE Biology */}
            {normalizedSubject === 'biology' && options.examBoard === 'aqa' && (
              <div className="sm:col-span-3">
                <label htmlFor="biologyUnit" className="block text-base font-semibold text-gray-800 mb-2">
                  Biology Unit
                </label>
                <select
                  id="biologyUnit"
                  value={options.biologyUnit}
                  onChange={(e) => setOptions({ ...options, biologyUnit: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a Biology unit</option>
                  <option value="cell-biology">1. Cell biology</option>
                  <option value="organisation">2. Organisation</option>
                  <option value="infection-response">3. Infection and response</option>
                  <option value="bioenergetics">4. Bioenergetics</option>
                  <option value="homeostasis-response">5. Homeostasis and response</option>
                  <option value="inheritance-variation-evolution">6. Inheritance, variation and evolution</option>
                  <option value="ecology">7. Ecology</option>
                  <option value="required-practicals">8. Required Practicals</option>
                </select>
              </div>
            )}

            {/* Biology Unit Selection - only for Edexcel GCSE Biology */}
            {normalizedSubject === 'biology' && options.examBoard === 'edexcel' && (
              <div className="sm:col-span-3">
                <label htmlFor="biologyEdexcelUnit" className="block text-base font-semibold text-gray-800 mb-2">
                  Biology Unit
                </label>
                <select
                  id="biologyEdexcelUnit"
                  value={options.biologyEdexcelUnit}
                  onChange={(e) => setOptions({ ...options, biologyEdexcelUnit: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a Biology unit</option>
                  <option value="key-concepts-biology">1. Key concepts in biology</option>
                  <option value="cells-control">2. Cells and control</option>
                  <option value="genetics">3. Genetics</option>
                  <option value="natural-selection-genetic-modification">4. Natural selection and genetic modification</option>
                  <option value="health-disease-medicines">5. Health, disease and the development of medicines</option>
                  <option value="plant-structures-functions">6. Plant structures and their functions</option>
                  <option value="animal-coordination-control-homeostasis">7. Animal coordination, control and homeostasis</option>
                  <option value="exchange-transport-animals">8. Exchange and transport in animals</option>
                  <option value="ecosystems-material-cycles">9. Ecosystems and material cycles</option>
                  <option value="required-practicals">10. Required Practicals</option>
                </select>
              </div>
            )}

            {/* Chemistry Unit Selection - only for AQA GCSE Chemistry */}
            {normalizedSubject === 'chemistry' && options.examBoard === 'aqa' && (
              <div className="sm:col-span-3">
                <label htmlFor="chemistryUnit" className="block text-base font-semibold text-gray-800 mb-2">
                  Chemistry Unit
                </label>
                <select
                  id="chemistryUnit"
                  value={options.chemistryUnit}
                  onChange={(e) => setOptions({ ...options, chemistryUnit: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a Chemistry unit</option>
                  <option value="atomic-structure-periodic-table">1. Atomic structure and the periodic table</option>
                  <option value="bonding-structure-properties">2. Bonding, structure, and the properties of matter</option>
                  <option value="quantitative-chemistry">3. Quantitative chemistry</option>
                  <option value="chemical-changes">4. Chemical changes</option>
                  <option value="energy-changes">5. Energy changes</option>
                  <option value="rate-extent-chemical-change">6. The rate and extent of chemical change</option>
                  <option value="organic-chemistry">7. Organic chemistry</option>
                  <option value="chemical-analysis">8. Chemical analysis</option>
                  <option value="chemistry-atmosphere">9. Chemistry of the atmosphere</option>
                  <option value="using-resources">10. Using resources</option>
                  <option value="required-practicals">11. Required Practicals</option>
                </select>
              </div>
            )}

            {/* Physics Unit Selection - only for AQA GCSE Physics */}
            {normalizedSubject === 'physics' && options.examBoard === 'aqa' && (
              <div className="sm:col-span-3">
                <label htmlFor="physicsUnit" className="block text-base font-semibold text-gray-800 mb-2">
                  Physics Unit
                </label>
                <select
                  id="physicsUnit"
                  value={options.physicsUnit}
                  onChange={(e) => setOptions({ ...options, physicsUnit: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a Physics unit</option>
                  <option value="energy">1. Energy</option>
                  <option value="electricity">2. Electricity</option>
                  <option value="particle-model-matter">3. Particle model of matter</option>
                  <option value="atomic-structure">4. Atomic structure</option>
                  <option value="forces">5. Forces</option>
                  <option value="waves">6. Waves</option>
                  <option value="magnetism-electromagnetism">7. Magnetism and electromagnetism</option>
                  <option value="space-physics">8. Space physics (physics only)</option>
                  <option value="required-practicals">9. Required Practicals</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="difficulty" className="block text-base font-semibold text-gray-800 mb-2">
                Difficulty
              </label>
              <select
                id="difficulty"
                value={options.difficulty}
                onChange={(e) => setOptions({ ...options, difficulty: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed (Easy → Hard)</option>
              </select>
            </div>

            <div>
              <label htmlFor="questionCount" className="block text-base font-semibold text-gray-800 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                id="questionCount"
                min="1"
                max="15"
                value={options.questionCount === 0 ? "" : options.questionCount}
                onChange={(e) => {
                  const val = e.target.value;
                  // Allow empty string for editing
                  if (val === "") {
                    setOptions({ ...options, questionCount: 0 });
                    e.target.setCustomValidity("");
                    return;
                  }
                  const numVal = parseInt(val, 10);
                  setOptions({ ...options, questionCount: numVal });
                  if (numVal > 15) {
                    e.target.setCustomValidity("Value must be less than or equal to 15. Smaller batches = better questions. Try a lower number for best results 👌");
                  } else {
                    e.target.setCustomValidity("");
                  }
                }}
                onBlur={(e) => {
                  // If left empty or 0, reset to 1
                  if (e.target.value === "" || parseInt(e.target.value, 10) < 1) {
                    setOptions({ ...options, questionCount: 1 });
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Search Topic Input */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <label htmlFor="topic" className="block text-base font-semibold text-gray-800">
                Search Topic
              </label>
              <div className="relative group">
                <span className="cursor-help text-sm">ℹ️</span>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Type any topic you want to practice - the suggestions are just examples!
                </div>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                id="topic"
                value={searchTopic}
                onChange={handleTopicInputChange}
                onFocus={handleTopicInputFocus}
                placeholder={placeholder}
                autoComplete="off"
                className="topic-search-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 !text-black !bg-white focus:!bg-white focus:!text-black"
              />
              <TopicDropdown
                searchTopic={searchTopic}
                onTopicSelect={handleTopicSelect}
                isVisible={showDropdown}
                subject={normalizedSubject}
                examLevel={options.examLevel}
                examBoard={options.examBoard}
                historyUnit={options.historyUnit}
                geographyUnit={options.geographyUnit}
                geographySection={options.geographySection}
                biologyUnit={options.biologyUnit}
                chemistryUnit={options.chemistryUnit}
                biologyEdexcelUnit={options.biologyEdexcelUnit}
                physicsUnit={options.physicsUnit}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-6 pt-4">
            <button
              type="submit"
              disabled={isGenerating}
              className={`flex-1 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 ${subjectTheme.bg} ${subjectTheme.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${subjectTheme.bg.replace('bg-', '')}`}
            >
              Generate Questions
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Choose Another Topic
            </button>
          </div>
        </form>

        {/* Loading Bar */}
        <LoadingBar 
          isVisible={isGenerating} 
          onCancel={handleCancelGeneration}
          ref={loadingBarRef}
        />

        {/* Generated Questions */}
        {generatedQuestions.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Generated Questions:</h2>
              <div className="flex gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={exportToPDFQuestionsOnly}
                    className="py-2 px-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Save PDF (Questions Only)
                  </button>
                  <button
                    onClick={exportToPDFWithSolutions}
                    className="py-2 px-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save PDF (With Solutions)
                  </button>
                </div>
                <button
                  onClick={handleShowSolutions}
                  disabled={isGeneratingSolutions}
                  className={`py-2 px-4 rounded-md shadow-sm text-sm font-medium text-gray-900 ${subjectTheme.bg} ${subjectTheme.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${subjectTheme.bg.replace('bg-', '')}`}
                >
                  {isGeneratingSolutions ? 'Generating...' : (showSolutions ? 'Hide Solutions' : 'Show Solutions')}
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 space-y-4">
              {generatedQuestions.map((question, index) => (
                <div key={`q-${index}`} className="p-4 border rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-gray-900">Question {index + 1}</h3>
                    {question.marks && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {question.marks} marks
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 mb-4">{cleanQuestion(question.question)}</p>
                  
                  {/* Display passage if it exists (for questions with passages) */}
                  {question.passage && (
                    <div className="mb-4 p-4 bg-gray-50 border-l-4 border-blue-500 rounded-md">
                      <h4 className="font-medium text-gray-900 mb-2">Extract:</h4>
                      <p className="text-gray-800 italic whitespace-pre-wrap">{question.passage}</p>
                    </div>
                  )}
                  
                  {showSolutions && (
                    <div className={`mt-4 space-y-4 ${subjectTheme.light} p-4 rounded-md`}>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Model Answer:</h4>
                        {Array.isArray(question.answer) ? (
                          <ol className="list-decimal list-inside">
                            {question.answer.map((stepObj: any, idx: number) => (
                              <li key={idx} className="mb-2">
                                <div className="flex items-start space-x-2">
                                  <span className="text-sm text-gray-500 mt-1">{idx + 1}.</span>
                                  <div>
                                    <p className="font-medium text-gray-800">{cleanQuestion(stepObj.step)}</p>
                                    <p className="text-gray-900">{cleanQuestion(String(stepObj.explanation))}</p>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <div className="text-gray-800 whitespace-pre-wrap">
  {typeof question.answer === 'object' && question.answer !== null ? 
    Object.entries(question.answer).map(([key, value]) => (
<div key={key} className="mb-3">
  <div className="flex items-start">
    <span className="text-gray-900 mr-2">•</span>
                                    <p className="text-gray-900">{cleanQuestion(String(value))}</p>
  </div>
</div>
    )) : 
                              <p>{cleanQuestion(String(question.answer))}</p>
  }
</div>
                        )}
                      </div>
                    
                      {question.markScheme && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Mark Scheme:</h4>
                          <p className="text-gray-800 whitespace-pre-wrap">{cleanQuestion(question.markScheme)}</p>
                        </div>
                      )}
                      {question.examTechnique && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Exam Technique Tips:</h4>
                          <p className="text-gray-800">{cleanQuestion(question.examTechnique)}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pricing Modal */}
      <PricingModal 
        isOpen={showPricingModal} 
        onClose={() => setShowPricingModal(false)} 
      />

      {/* Streak Popup */}
      <StreakPopup 
        isOpen={showStreakPopup}
        onClose={() => setShowStreakPopup(false)}
        streakCount={newStreakCount}
      />

      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
  );
};

export default QuestionGenerator;
