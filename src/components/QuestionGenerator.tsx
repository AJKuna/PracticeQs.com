import React, { useState, useEffect } from 'react';
//import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import PricingModal from './PricingModal';

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
    questionCount: 10
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [generatedSolutions, setGeneratedSolutions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSolutions, setIsGeneratingSolutions] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [alert, setAlert] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Fetch user's current usage on component mount
  useEffect(() => {
    if (user?.id) {
      fetchUsage();
    }
  }, [user?.id]);

  const fetchUsage = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/usage/${user.id}`);
      if (response.ok) {
        const usageData = await response.json();
        setUsage(usageData);
        
        // Show pricing modal immediately if user hits their limit and is not premium
        if (!usageData.isPremium && usageData.usage >= usageData.limit) {
          setShowPricingModal(true);
        }
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

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
  const placeholder = 'Enter a topic...';

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
    setIsGenerating(true);
    setAlert(null);
    
    // Validate exam board for GCSE
    if (options.examLevel === 'gcse' && !options.examBoard) {
      setAlert({ type: 'error', message: 'Please choose an exam board' });
      setIsGenerating(false);
      return;
    }

    if (!user?.id) {
      setAlert({ type: 'error', message: 'Please log in to generate questions' });
      setIsGenerating(false);
      return;
    }
    
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: normalizedSubject,
          topic: searchTopic,
          numQuestions: options.questionCount,
          difficulty: options.difficulty,
          examLevel: options.examLevel,
          examBoard: options.examBoard,
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
      setAlert({ type: 'success', message: 'Questions generated successfully!' });
      
      // Refresh usage after successful generation
      await fetchUsage();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Error generating questions' });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSolutions = () => setShowSolutions((prev) => !prev);
  // Replace the existing generateSolutions function with this:
  const generateSolutions = async () => {
    setIsGeneratingSolutions(true);
    setAlert(null);
    try {
      const response = await fetch('/api/generate-solutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: generatedQuestions,
          subject: normalizedSubject,
          topic: searchTopic,
          examLevel: options.examLevel,
          examBoard: options.examBoard
        }),
      });

      if (!response.ok) throw new Error('Failed to generate solutions');

      const data = await response.json();

      // Process the answers to ensure they are strings
      const processedQuestions = data.map(question => {
        if (typeof question.answer === 'object' && question.answer !== null) {
          // Convert the object to a string (e.g., JSON stringify)
          question.answer = JSON.stringify(question.answer);
        }
        return question;
      });

      setGeneratedSolutions(processedQuestions);
      setAlert({ type: 'success', message: 'Solutions generated successfully!' });
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'Error generating solutions' });
    } finally {
      setIsGeneratingSolutions(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

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
        const lineSpacing = 8;
        for (let y = 30; y <= pageHeight - 20; y += lineSpacing) {
          doc.line(20, y, pageWidth - 20, y);
        }
      }
    };

    // Add background pattern to first page
    addBackgroundPattern();

    // Add title
    doc.setFontSize(16);
    doc.text(`${normalizedSubject.charAt(0).toUpperCase() + normalizedSubject.slice(1)} Practice Questions`, 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text(`Topic: ${searchTopic}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Difficulty: ${options.difficulty} | Level: ${options.examLevel.toUpperCase()}`, 20, yPosition);
    yPosition += 20;

    // Add questions
    generatedQuestions.forEach((question, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        addBackgroundPattern(); // Add pattern to new page
        yPosition = 20;
      }

      // Question header
      doc.setFontSize(14);
      doc.text(`Question ${index + 1}`, 20, yPosition);
      if (question.marks) {
        doc.setFontSize(10);
        doc.text(`[${question.marks} marks]`, 150, yPosition);
        doc.setFontSize(14);
      }
      yPosition += 10;

      // Question text
      doc.setFontSize(11);
      const questionLines = doc.splitTextToSize(question.question, 170);
      doc.text(questionLines, 20, yPosition);
      yPosition += questionLines.length * 5 + 25; // Increased spacing for writing space

// Add solutions if they're visible
if (showSolutions && question.answer) {
  doc.setFontSize(12);
  doc.text('Answer:', 20, yPosition);
  yPosition += 7;

  doc.setFontSize(10);
  
  // Format answer exactly like the browser display with bullet points
  let answerText = '';
  if (typeof question.answer === 'object' && question.answer !== null) {
    // Convert to bullet points like in browser
    answerText = Object.entries(question.answer).map(([key, value]) => 
      `• ${value}`
    ).join('\n');
  } else {
    answerText = String(question.answer);
  }
  
  const answerLines = doc.splitTextToSize(answerText, 170);
  doc.text(answerLines, 20, yPosition);
  yPosition += answerLines.length * 4 + 25; // Increased spacing
} else {
  yPosition += 25; // Increased spacing between questions
}
    });

    // Save the PDF
    doc.save(`${normalizedSubject}-${searchTopic.replace(/\s+/g, '-')}-questions.pdf`);
    setAlert({ type: 'success', message: 'PDF exported successfully!' });
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
      questionCount: 10
    });
    setGeneratedQuestions([]);
    setGeneratedSolutions([]);
    setShowSolutions(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Logo in top left corner */}
      <div className="absolute top-4 left-4 z-10">
        <img 
          src="/logo.svg" 
          alt="Logo" 
          className="h-24 w-auto"
        />
      </div>
      
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 capitalize">
            {normalizedSubject} Practice Questions
          </h1>
          <div className="flex gap-2">
            {/* Upgrade button - only show for non-premium users */}
            {profile && profile.subscription_tier === 'free' && (
              <button
                onClick={() => setShowPricingModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 rounded-lg transition-colors duration-200 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-medium">Upgrade</span>
              </button>
            )}
            
            {/* Home Button */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors duration-200 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-sm font-medium">Home</span>
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

        {/* Usage Counter */}
        {usage &&
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Daily Usage
                </h3>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {(() => {
                    // Handle invalid data from database errors
                    const currentUsage = isNaN(usage.usage) ? 30 : usage.usage;
                    const currentLimit = usage.limit === 'unlimited' ? '∞' : (isNaN(usage.limit) ? 30 : usage.limit);
                    return `${currentUsage}/${currentLimit} questions`;
                  })()}
                </p>
              </div>
              <div className="text-right">
                {usage.isPremium ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Premium
                  </span>
                ) : (
                  <button
                    onClick={() => setShowPricingModal(true)}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                  >
                    Upgrade to Premium
                  </button>
                )}
              </div>
            </div>
            {!usage.isPremium && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((usage.usage / usage.limit) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {(() => {
                      const remaining = usage.limit - usage.usage;
                      if (isNaN(remaining) || remaining <= 0) {
                        return "Zero questions remaining today.";
                      }
                      return `${remaining} questions remaining today`;
                    })()}
                  </p>
                </div>
              </div>
            )}
          </div>
        }

        {/* Test button - Remove this after testing */}
        {profile && profile.subscription_tier === 'free' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <button
              onClick={() => {
                console.log('Test button clicked, showPricingModal state:', showPricingModal);
                setShowPricingModal(true);
                console.log('Set showPricingModal to true');
              }}
              className="bg-yellow-600 text-white px-4 py-2 rounded font-medium hover:bg-yellow-700"
            >
              🧪 Test Pricing Modal (Remove this button after testing)
            </button>
            <p className="text-xs text-yellow-800 mt-1">Debug: Modal state is {showPricingModal ? 'OPEN' : 'CLOSED'}</p>
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 !text-black !bg-white focus:!bg-white focus:!text-black placeholder-gray-500"
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
                onChange={(e) => setOptions({ ...options, examLevel: e.target.value, examBoard: '' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="ks3">KS3</option>
                <option value="gcse">GCSE</option>
                <option value="alevel" disabled>A Level (Coming Soon)</option>
                <option value="university" disabled>University (Coming Soon)</option>
              </select>
            </div>

            {options.examLevel === 'gcse' && (
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
                max="30"
                value={options.questionCount === "" ? "" : options.questionCount}
                onChange={(e) => {
                  const val = e.target.value;
                  setOptions({ ...options, questionCount: val === "" ? "" : parseInt(val) });
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
                {generatedSolutions.length > 0 ? (
                  <button
                    onClick={toggleSolutions}
                    className={`py-2 px-4 rounded-md shadow-sm text-sm font-medium text-gray-900 ${subjectTheme.bg} ${subjectTheme.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${subjectTheme.bg.replace('bg-', '')}`}
                  >
                    {showSolutions ? 'Hide Solutions' : 'Show Solutions'}
                  </button>
                ) : (
                  <button
                    onClick={generateSolutions}
                    disabled={isGeneratingSolutions}
                    className={`py-2 px-4 rounded-md shadow-sm text-sm font-medium text-gray-900 ${subjectTheme.bg} ${subjectTheme.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${subjectTheme.bg.replace('bg-', '')}`}
                  >
                    {isGeneratingSolutions ? 'Generating...' : 'Generate Solutions'}
                  </button>
                )}
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
                  {showSolutions && (
                    <div className={`mt-4 space-y-4 ${subjectTheme.light} p-4 rounded-md`}>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Model Answer:</h4>
                        {Array.isArray(question.answer) ? (
                          <ol className="list-decimal list-inside">
                            {question.answer.map((stepObj, idx) => (
                              <li key={idx} className="mb-2">
                                <span className="font-semibold">{stepObj.step}:</span> {stepObj.explanation || stepObj.marks}
                                {stepObj.marks && <span className="text-blue-600"> [{stepObj.marks} marks]</span>}
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
    <p className="text-gray-900">{value}</p>
  </div>
</div>
    )) : 
    <p>{question.answer}</p>
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