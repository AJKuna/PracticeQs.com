import React, { useState, useEffect } from 'react';
//import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import PricingModal from './PricingModal';
import { API_CONFIG } from '../config/api';
import { trackQuestionGeneration, trackPDFExport, trackButtonClick, trackError, trackSubscription } from '../utils/analytics';

// ... (interfaces and constants unchanged)

const QuestionGenerator: React.FC = () => {
  const { subject } = useParams<{ subject: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const normalizedSubject = subject?.replace(/-/g, ' ') || 'mathematics';

  // State
  const [searchTopic, setSearchTopic] = useState('');
  const [options, setOptions] = useState({
    examLevel: 'gcse',
    examBoard: '',
    difficulty: 'easy',
    questionCount: 10,
    englishExamType: '' // New field for English Language vs Literature
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [generatedSolutions, setGeneratedSolutions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSolutions, setIsGeneratingSolutions] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [alert, setAlert] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Fetch user usage on component mount and when user changes
  useEffect(() => {
    if (user) {
      const fetchUsage = async () => {
        try {
          const response = await fetch(API_CONFIG.ENDPOINTS.USAGE(user.id));
          if (response.ok) {
            const data = await response.json();
            setUsage(data);
            
            // Show pricing modal immediately if user hits their limit and is not premium
            if (!data.isPremium && data.usage >= data.limit) {
              setShowPricingModal(true);
            }
          }
        } catch (error) {
          console.error('Error fetching usage:', error);
        }
      };
      
      // Only fetch usage data - profile is managed by AuthContext
      fetchUsage();
    }
  }, [user, profile?.subscription_tier]); // Include profile tier to refresh usage when subscription changes

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
  
  // Determine which placeholder to use
  let placeholderKey = normalizedSubject;
  if (normalizedSubject === 'english' && options.englishExamType) {
    placeholderKey = options.englishExamType;
  }
  const placeholder = subjectPlaceholders[placeholderKey] || 'Enter a topic...';

  // Clean question string to format values
  const cleanQuestion = (question: string) => {
    const questionChars = [];
    let isCurrentSuperscript = false // If the current character is a superscript
    let isCurrentSubscript = false // If the current character is a subscript
    let prevStr = "" // Previous character
    for (const char of question) {
      // Handle superscript
      if (char === "^") {
        isCurrentSuperscript = true // Set current character to superscript
        continue
      }
      else if(isCurrentSuperscript) {
        if (!isNaN(Number(char))) {
          questionChars.push(<sup>{char}</sup>) // Display character as a superscript
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
          questionChars.push(<sub>{char}</sub>) // Display character as a subscript
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
          questionChars.push(<>&rarr;</>)
          prevStr = ""
          continue
        }
        else questionChars.push(prevStr)
      }
      questionChars.push(char)
      prevStr = ""
    }
    
    return <>{questionChars.map(char => <>{char}</>)}</>
  };

  // Fetch questions from backend
  const generateQuestions = async () => {
    if (!user) return;

    setIsGenerating(true);
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
          userId: user.id
        }),
      });

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
      setGeneratedQuestions(data);
      
      // Track successful question generation
      trackQuestionGeneration(normalizedSubject, searchTopic, data.length, options.difficulty);
      
      // Refresh usage after generating questions
      if (user) {
        const response = await fetch(API_CONFIG.ENDPOINTS.USAGE(user.id));
        if (response.ok) {
          const data = await response.json();
          setUsage(data);
        }
      }
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Error generating questions' });
      // Track generation errors
      trackError('question_generation', error.message || 'Unknown error', 'QuestionGenerator');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSolutions = () => setShowSolutions((prev) => !prev);
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

  const exportToPDF = () => {
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
      doc.text(searchTopic, leftMargin, 20); // Move closer to top
      doc.setFont('helvetica', 'normal');
      yPosition = getNextLinePosition(firstLineY + gridSpacing * 4); // Start questions after grid spacing
    } else {
      // For lined subjects, align with lines
      doc.setFontSize(18); // Bigger font size
      doc.setFont('helvetica', 'bold');
      doc.text(searchTopic, leftMargin, 20); // Move closer to top
      doc.setFont('helvetica', 'normal');
      yPosition = getNextLinePosition(firstLineY + lineSpacing); // Start questions after first line
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

      // Question text - align with grid/lines
      doc.setFontSize(10); // Consistent font size for question text
      const questionLines = doc.splitTextToSize(question.question, lineLength);
      
      // Place each line on grid/lines
      questionLines.forEach((line: string) => {
        doc.text(line, leftMargin, yPosition);
        yPosition = getNextLinePosition(yPosition + spacingUnit);
      });
      // Add extra space for writing
      yPosition = getNextLinePosition(yPosition + spacingUnit * 3);

      // Display passage if it exists (for questions with passages)
      if (question.passage) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Extract:', leftMargin, yPosition);
        doc.setFont('helvetica', 'normal');
        yPosition = getNextLinePosition(yPosition + spacingUnit);
        
        doc.setFontSize(8); // Smaller font for passages
        const passageLines = doc.splitTextToSize(question.passage, lineLength);
        passageLines.forEach((line: string) => {
          doc.text(line, leftMargin, yPosition);
          yPosition = getNextLinePosition(yPosition + spacingUnit);
        });
        yPosition = getNextLinePosition(yPosition + spacingUnit);
      }

      // Add solutions if they're visible
      if (showSolutions && question.answer) {
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
        
        const answerLines = doc.splitTextToSize(answerText, lineLength);
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

    // Save the PDF
    doc.save(`${normalizedSubject}-${searchTopic.replace(/\s+/g, '-')}-questions.pdf`);
    
    // Track PDF export
    trackPDFExport(normalizedSubject, searchTopic, generatedQuestions.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateQuestions();
  };

  const resetForm = () => {
    setSearchTopic('');
    setOptions({
      examLevel: 'gcse',
      examBoard: '',
      difficulty: 'easy',
      questionCount: 10,
      englishExamType: ''
    });
    setGeneratedQuestions([]);
    setGeneratedSolutions([]);
    setShowSolutions(false);
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
          <div className="flex gap-1 sm:gap-2">
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
              return "Zero questions remaining today.";
            }
            return `${remaining} questions remaining today`;
          })()}
        </p>
      </div>
    </div>
  </div>
)}


        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Search Topic Input */}
          <div>
            <label htmlFor="topic" className="block text-base font-semibold text-gray-800 mb-2">
              Search Topic
            </label>
            <input
              type="text"
              id="topic"
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              placeholder={placeholder}
              className="topic-search-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 !text-black !bg-white focus:!bg-white focus:!text-black"
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <label htmlFor="examLevel" className="block text-base font-semibold text-gray-800 mb-2">
                Exam Level
              </label>
              <select
                id="examLevel"
                value={options.examLevel}
                onChange={(e) => setOptions({ ...options, examLevel: e.target.value, examBoard: '', englishExamType: '' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="gcse">GCSE</option>
                <option value="ks3" disabled>KS3 (Coming Soon)</option>
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
                  onChange={(e) => setOptions({ ...options, englishExamType: e.target.value, examBoard: '' })}
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
                    onChange={(e) => setOptions({ ...options, examBoard: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select an exam board</option>
                    <option value="aqa">AQA</option>
                    <option value="edexcel">Edexcel</option>
                    <option value="ocr" disabled>OCR (Coming Soon)</option>
                    <option value="wjec" disabled>WJEC (Coming Soon)</option>
                  </select>
                </div>
              )
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
                value={options.questionCount}
                onChange={(e) => {
                  const val = e.target.value;
                  const numVal = val === "" ? 1 : parseInt(val);
                  setOptions({ ...options, questionCount: numVal });
                  
                  // Custom validation message
                  if (numVal > 15) {
                    e.target.setCustomValidity("Value must be less than or equal to 15. Smaller batches = better questions. Try a lower number for best results 👌");
                  } else {
                    e.target.setCustomValidity("");
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              {isGenerating ? 'Generating...' : 'Generate Questions'}
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

        {/* Generated Questions */}
        {generatedQuestions.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Generated Questions:</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportToPDF}
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Save as PDF
                </button>
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
                                    <p className="font-medium text-gray-800">{stepObj.step}</p>
                                    <p className="text-gray-900">{String(stepObj.explanation)}</p>
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
    <p className="text-gray-900">{String(value)}</p>
  </div>
</div>
    )) : 
    <p>{String(question.answer)}</p>
  }
</div>
                        )}
                      </div>
                    
                      {question.markScheme && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Mark Scheme:</h4>
                          <p className="text-gray-800 whitespace-pre-wrap">{question.markScheme}</p>
                        </div>
                      )}
                      {question.examTechnique && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Exam Technique Tips:</h4>
                          <p className="text-gray-800">{question.examTechnique}</p>
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
    </div>
  );
};

export default QuestionGenerator;
