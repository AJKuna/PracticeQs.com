import React, { useState, useEffect, useRef } from 'react';
//import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PricingModal from './PricingModal';
import TopicDropdown from './TopicDropdown';

import LoadingBar from './LoadingBar';
import StreakCounter, { StreakCounterRef } from './StreakCounter';
import StreakPopup from './StreakPopup';
import StickyFeedbackBar from './StickyFeedbackBar';
import { API_CONFIG } from '../config/api';
import { trackQuestionGeneration, trackPDFExport, trackButtonClick, trackError, trackSubscription } from '../utils/analytics';
import { biologyGcseAqaUnits } from '../data/biologyGcseAqaUnits';
import { biologyGcseAqaUnitsData, getBiologyUnits } from '../data/biologyGcseAqaUnitsData';
import { chemistryGcseAqaUnitsData, getChemistryUnits } from '../data/chemistryGcseAqaUnitsData';
import { chemistryGcseEdexcelUnitsData, getChemistryEdexcelUnits } from '../data/chemistryGcseEdexcelUnitsData';
import { biologyGcseEdexcelUnitsData, getBiologyEdexcelUnits } from '../data/biologyGcseEdexcelUnitsData';
import { physicsGcseAqaUnitsData, getPhysicsUnits } from '../data/physicsGcseAqaUnitsData';
import { mathGcseEdexcelUnits } from '../data/mathGcseEdexcelUnits';
import { historyGcseAqaUnitsData, getHistoryUnits } from '../data/historyGcseAqaUnitsData';
import { getGeographyAqaUnits, getGeographyAqaSections, getGeographyAqaTopics } from '../data/geographyGcseAqaUnitsData';
import { religiousStudiesGcseAqaUnits, getReligiousStudiesComponents, getReligiousStudiesReligions, getReligiousStudiesThemes } from '../data/religiousStudiesGcseAqaUnits';
import { getUserStreak, updateStreakOnGeneration, StreakData } from '../services/streakService';


// ... (interfaces and constants unchanged)

const QuestionGenerator: React.FC = () => {
  const { subject } = useParams<{ subject: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const normalizedSubject = subject?.replace(/-/g, ' ') || 'mathematics';

  // LocalStorage keys for persistence - user-specific when logged in
  const getStorageKey = (suffix: string) => {
    const userPrefix = user?.id ? `user_${user.id}_` : 'anonymous_';
    return `practiceqs_${userPrefix}${normalizedSubject}_${suffix}`;
  };
  
  // Helper functions for localStorage persistence
  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  };

  const loadFromLocalStorage = (key: string, defaultValue: any = null) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return defaultValue;
    }
  };

  const clearFromLocalStorage = (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear from localStorage:', error);
    }
  };

  // State with localStorage initialization
  const [searchTopic, setSearchTopic] = useState(() => 
    loadFromLocalStorage(getStorageKey('searchTopic'), '')
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(() => 
    loadFromLocalStorage(getStorageKey('selectedTopic'), '')
  );
  const [options, setOptions] = useState(() => 
    loadFromLocalStorage(getStorageKey('options'), {
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
      chemistryEdexcelUnit: '', // New field for Chemistry Edexcel units
      biologyEdexcelUnit: '', // New field for Biology Edexcel units
      physicsUnit: '', // New field for Physics AQA units
      mathUnit: '', // New field for Mathematics Edexcel units
      religiousStudiesComponent: '', // New field for Religious Studies component
      religiousStudiesUnit: '' // New field for Religious Studies unit
    })
  );
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>(() => 
    loadFromLocalStorage(getStorageKey('questions'), [])
  );
  const [generatedSolutions, setGeneratedSolutions] = useState<any[]>(() => 
    loadFromLocalStorage(getStorageKey('solutions'), [])
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSolutions, setIsGeneratingSolutions] = useState(false);
  const [showSolutions, setShowSolutions] = useState(() => 
    loadFromLocalStorage(getStorageKey('showSolutions'), false)
  );
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
  
  // Copy to clipboard state
  const [copiedQuestions, setCopiedQuestions] = useState<Set<number>>(new Set());

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveToLocalStorage(getStorageKey('searchTopic'), searchTopic);
  }, [searchTopic, normalizedSubject]);

  useEffect(() => {
    saveToLocalStorage(getStorageKey('selectedTopic'), selectedTopic);
  }, [selectedTopic, normalizedSubject]);

  useEffect(() => {
    saveToLocalStorage(getStorageKey('options'), options);
  }, [options, normalizedSubject]);

  useEffect(() => {
    saveToLocalStorage(getStorageKey('questions'), generatedQuestions);
  }, [generatedQuestions, normalizedSubject]);

  useEffect(() => {
    saveToLocalStorage(getStorageKey('solutions'), generatedSolutions);
  }, [generatedSolutions, normalizedSubject]);

  useEffect(() => {
    saveToLocalStorage(getStorageKey('showSolutions'), showSolutions);
  }, [showSolutions, normalizedSubject]);

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
      setOptions((prev: any) => ({ ...prev, examLevel: 'gcse', examBoard: '', englishExamType: '', historyUnit: '', geographyUnit: '', geographySection: '', biologyUnit: '', chemistryUnit: '', biologyEdexcelUnit: '', physicsUnit: '', mathUnit: '', religiousStudiesComponent: '', religiousStudiesUnit: '' }));
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
      const unitTopics = biologyGcseEdexcelUnitsData[options.biologyEdexcelUnit];
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
      const unitTopics = chemistryGcseAqaUnitsData[options.chemistryUnit];
      if (unitTopics && unitTopics.length > 0) {
        const averageLength = unitTopics.slice(0, 4).reduce((sum, topic) => sum + topic.length, 0) / Math.min(4, unitTopics.length);
        const numTopics = averageLength > 50 ? 2 : averageLength > 30 ? 3 : 4;
        
        let sampleTopics = unitTopics.slice(0, numTopics).join(', ');
        
        if (sampleTopics.length > 80) {
          sampleTopics = sampleTopics.substring(0, 77) + '...';
        }
        
        return `e.g. ${sampleTopics}...`;
      }
    } else if (normalizedSubject === 'chemistry' && options.examLevel === 'gcse' && options.examBoard === 'edexcel' && options.chemistryEdexcelUnit) {
      const unitTopics = chemistryGcseEdexcelUnitsData[options.chemistryEdexcelUnit];
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
      const unitTopics = physicsGcseAqaUnitsData[options.physicsUnit];
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
    } else if (normalizedSubject === 'history' && options.examLevel === 'gcse' && options.examBoard === 'aqa' && options.historyUnit) {
      const unitTopics = historyGcseAqaUnitsData[options.historyUnit];
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
      return `e.g. Enter history topics for ${options.historyUnit}...`;
    } else if (normalizedSubject === 'mathematics' && options.examLevel === 'gcse' && options.examBoard === 'edexcel' && options.mathUnit) {
      const unitTopics = mathGcseEdexcelUnits[options.mathUnit];
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
      return `e.g. Enter mathematics topics for ${options.mathUnit}...`;
    } else if (normalizedSubject === 'geography' && options.examLevel === 'gcse' && options.examBoard === 'aqa' && options.geographyUnit) {
      const unitTopics = getGeographyAqaTopics(options.geographyUnit, options.geographySection);
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
      const unitName = getGeographyAqaUnits().find(u => u.value === options.geographyUnit)?.title || 'selected unit';
      return `e.g. Enter geography topics for ${unitName}...`;
    }
    
    return subjectPlaceholders[placeholderKey] || 'Enter a topic...';
  };

  const placeholder = getDynamicPlaceholder();

  // Function to get available topics for Religious Studies, Mathematics Edexcel, Biology AQA, Biology Edexcel, Chemistry AQA, Geography AQA, and History AQA
  const getAvailableTopics = (): string[] => {
    if (normalizedSubject === 'religious studies' && options.examLevel === 'gcse' && options.examBoard === 'aqa' && options.religiousStudiesComponent && options.religiousStudiesUnit) {
      const componentData = religiousStudiesGcseAqaUnits[options.religiousStudiesComponent];
      if (componentData && componentData[options.religiousStudiesUnit]) {
        return componentData[options.religiousStudiesUnit] || [];
      }
    }
    if (normalizedSubject === 'mathematics' && options.examLevel === 'gcse' && options.examBoard === 'edexcel' && options.mathUnit) {
      return mathGcseEdexcelUnits[options.mathUnit] || [];
    }
    if (normalizedSubject === 'biology' && options.examLevel === 'gcse' && options.examBoard === 'aqa' && options.biologyUnit) {
      return biologyGcseAqaUnitsData[options.biologyUnit] || [];
    }
    if (normalizedSubject === 'biology' && options.examLevel === 'gcse' && options.examBoard === 'edexcel' && options.biologyEdexcelUnit) {
      return biologyGcseEdexcelUnitsData[options.biologyEdexcelUnit] || [];
    }
    if (normalizedSubject === 'chemistry' && options.examLevel === 'gcse' && options.examBoard === 'aqa' && options.chemistryUnit) {
      return chemistryGcseAqaUnitsData[options.chemistryUnit] || [];
    }
    if (normalizedSubject === 'chemistry' && options.examLevel === 'gcse' && options.examBoard === 'edexcel' && options.chemistryEdexcelUnit) {
      return chemistryGcseEdexcelUnitsData[options.chemistryEdexcelUnit] || [];
    }
    if (normalizedSubject === 'physics' && options.examLevel === 'gcse' && options.examBoard === 'aqa' && options.physicsUnit) {
      return physicsGcseAqaUnitsData[options.physicsUnit] || [];
    }
    if (normalizedSubject === 'geography' && options.examLevel === 'gcse' && options.examBoard === 'aqa' && options.geographyUnit) {
      return getGeographyAqaTopics(options.geographyUnit, options.geographySection) || [];
    }
    if (normalizedSubject === 'history' && options.examLevel === 'gcse' && options.examBoard === 'aqa' && options.historyUnit) {
      return historyGcseAqaUnitsData[options.historyUnit] || [];
    }
    return [];
  };

  // Check if we should show topic grid (for Religious Studies, Mathematics Edexcel, Biology AQA, Biology Edexcel, Chemistry AQA, Chemistry Edexcel, Physics AQA, Geography AQA, and History AQA with proper selections)
  const shouldShowTopicGrid = (normalizedSubject === 'religious studies' && 
    options.examLevel === 'gcse' && 
    options.examBoard === 'aqa' && 
    options.religiousStudiesComponent && 
    options.religiousStudiesUnit) ||
    (normalizedSubject === 'mathematics' && 
    options.examLevel === 'gcse' && 
    options.examBoard === 'edexcel' && 
    options.mathUnit) ||
    (normalizedSubject === 'biology' && 
    options.examLevel === 'gcse' && 
    options.examBoard === 'aqa' && 
    options.biologyUnit) ||
    (normalizedSubject === 'biology' && 
    options.examLevel === 'gcse' && 
    options.examBoard === 'edexcel' && 
    options.biologyEdexcelUnit) ||
    (normalizedSubject === 'chemistry' && 
    options.examLevel === 'gcse' && 
    options.examBoard === 'aqa' && 
    options.chemistryUnit) ||
    (normalizedSubject === 'chemistry' && 
    options.examLevel === 'gcse' && 
    options.examBoard === 'edexcel' && 
    options.chemistryEdexcelUnit) ||
    (normalizedSubject === 'physics' && 
    options.examLevel === 'gcse' && 
    options.examBoard === 'aqa' && 
    options.physicsUnit) ||
    (normalizedSubject === 'geography' && 
    options.examLevel === 'gcse' && 
    options.examBoard === 'aqa' && 
    options.geographyUnit && 
    (options.geographySection || options.geographyUnit === 'geographical-skills')) ||
    (normalizedSubject === 'history' && 
    options.examLevel === 'gcse' && 
    options.examBoard === 'aqa' && 
    options.historyUnit);

  // Get filtered topics for display
  const availableTopics = getAvailableTopics();
  const filteredTopicsForDisplay = searchTopic.trim() 
    ? availableTopics.filter(topic => topic.toLowerCase().includes(searchTopic.toLowerCase()))
    : availableTopics;

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
    
    // Validate topic is entered or selected
    const topicToUse = selectedTopic || searchTopic.trim();
    if (!topicToUse) {
      setAlert({ type: 'error', message: 'Please select or enter a topic' });
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

    // Check for Chemistry Edexcel unit selection
    if (normalizedSubject === 'chemistry' && options.examBoard === 'edexcel' && options.examLevel === 'gcse' && !options.chemistryEdexcelUnit) {
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

    // Check for Mathematics unit selection
    if (normalizedSubject === 'mathematics' && options.examBoard === 'edexcel' && options.examLevel === 'gcse' && !options.mathUnit) {
      setAlert({ type: 'error', message: 'Please choose a Mathematics unit' });
      setIsGenerating(false);
      return;
    }

    // Check for Religious Studies component selection
    if (normalizedSubject === 'religious studies' && options.examBoard === 'aqa' && options.examLevel === 'gcse' && !options.religiousStudiesComponent) {
      setAlert({ type: 'error', message: 'Please choose a Religious Studies component' });
      setIsGenerating(false);
      return;
    }

    // Check for Religious Studies unit selection
    if (normalizedSubject === 'religious studies' && options.examBoard === 'aqa' && options.examLevel === 'gcse' && options.religiousStudiesComponent && !options.religiousStudiesUnit) {
      setAlert({ type: 'error', message: 'Please choose a Religious Studies unit' });
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
          topic: topicToUse,
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
          chemistryEdexcelUnit: options.chemistryEdexcelUnit, // Include chemistry unit for Edexcel Chemistry
          biologyEdexcelUnit: options.biologyEdexcelUnit, // Include biology unit for Edexcel Biology
          physicsUnit: options.physicsUnit, // Include physics unit for AQA Physics
          mathUnit: options.mathUnit, // Include mathematics unit for Edexcel Mathematics
          religiousStudiesComponent: options.religiousStudiesComponent, // Include religious studies component for AQA Religious Studies
          religiousStudiesUnit: options.religiousStudiesUnit // Include religious studies unit for AQA Religious Studies
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
        trackQuestionGeneration(normalizedSubject, topicToUse, data.length, options.difficulty);
        
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
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const titleText = formatMathForPDF(selectedTopic || searchTopic);
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
      doc.setFontSize(14); // Reduced font size
      doc.setFont('helvetica', 'bold');
      const titleText = formatMathForPDF(selectedTopic || searchTopic);
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
    const topicForFileName = selectedTopic || searchTopic.trim();
    const fileName = `${normalizedSubject}-${topicForFileName.replace(/\s+/g, '-')}-questions.pdf`;
    doc.save(fileName);
    
    // Track PDF export
    trackPDFExport(normalizedSubject, topicForFileName, generatedQuestions.length);
  };

  // Export PDF with solutions included
  const exportToPDFWithSolutions = () => {
    const doc = generatePDFContent(true);
    const topicForFileName = selectedTopic || searchTopic.trim();
    const fileName = `${normalizedSubject}-${topicForFileName.replace(/\s+/g, '-')}-questions-with-solutions.pdf`;
    doc.save(fileName);
    
    // Track PDF export
    trackPDFExport(normalizedSubject, topicForFileName, generatedQuestions.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateQuestions();
  };

  const resetForm = () => {
    setSearchTopic('');
    setSelectedTopic('');
    setGeneratedQuestions([]);
    setGeneratedSolutions([]);
    setShowSolutions(false);
    setIsGenerating(false);
    setIsCancelled(false);
    setOptions((prev: any) => ({ ...prev, historyUnit: '', geographyUnit: '', geographySection: '', biologyUnit: '', chemistryUnit: '', biologyEdexcelUnit: '', physicsUnit: '', mathUnit: '', religiousStudiesComponent: '', religiousStudiesUnit: '' }));
    
    // Clear localStorage when user explicitly chooses another topic
    clearFromLocalStorage(getStorageKey('searchTopic'));
    clearFromLocalStorage(getStorageKey('selectedTopic'));
    clearFromLocalStorage(getStorageKey('questions'));
    clearFromLocalStorage(getStorageKey('solutions'));
    clearFromLocalStorage(getStorageKey('showSolutions'));
    // Note: We don't clear options as they might want to keep their exam level/board settings
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

  // Handle topic selection from dropdown or grid
  const handleTopicSelect = (topic: string) => {
    if (shouldShowTopicGrid) {
      // For Religious Studies grid mode
      setSelectedTopic(topic);
      setSearchTopic(topic);
      setShowDropdown(false);
    } else {
      // For other subjects (existing behavior)
      setSearchTopic(topic);
      setShowDropdown(false);
    }
  };

  // Handle input change and show dropdown
  const handleTopicInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTopic(value);
    
    if (shouldShowTopicGrid) {
      // For Religious Studies, clear selected topic if typing something different
      if (value !== selectedTopic) {
        setSelectedTopic('');
      }
      // If input exactly matches a topic, select it
      if (availableTopics.includes(value)) {
        setSelectedTopic(value);
      }
    } else {
      // For other subjects (existing behavior)
      setShowDropdown(value.trim().length > 0);
    }
  };

  // Handle input focus to show dropdown
  const handleTopicInputFocus = () => {
    if (!shouldShowTopicGrid && searchTopic.trim().length > 0) {
      setShowDropdown(true);
    }
  };

  // Handle clear button
  const handleClearTopic = () => {
    setSearchTopic('');
    setSelectedTopic('');
    setShowDropdown(false);
  };

  // Copy question as image to clipboard
  const copyQuestionAsImage = async (questionIndex: number) => {
    const questionElement = document.getElementById(`question-content-${questionIndex}`);
    if (!questionElement) return;

    try {
      const canvas = await html2canvas(questionElement, {
        backgroundColor: null,
        scale: 2,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error("Failed to create blob from canvas");
          alert("Failed to capture question as image.");
          return;
        }
        
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ]);
          
          // Add to copied set and remove after 2 seconds
          setCopiedQuestions(prev => new Set([...prev, questionIndex]));
          setTimeout(() => {
            setCopiedQuestions(prev => {
              const newSet = new Set(prev);
              newSet.delete(questionIndex);
              return newSet;
            });
          }, 2000);
        } catch (err) {
          console.error("Failed to copy: ", err);
          alert("Your browser doesn't allow copying images directly.");
        }
      });
    } catch (error) {
      console.error("Failed to capture question: ", error);
      alert("Failed to capture question as image.");
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
            className="h-8 w-auto sm:h-12 lg:h-16"
          />
        </button>
      </div>
      
      <div className="max-w-3xl mx-auto pt-16 sm:pt-20 lg:pt-0">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 capitalize">
            {normalizedSubject}
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

{/* Enhanced Debugging - check console: currently removed */}


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
                onChange={(e) => setOptions({ ...options, examLevel: e.target.value, examBoard: '', englishExamType: '', historyUnit: '', geographyUnit: '', geographySection: '', biologyUnit: '', chemistryUnit: '', biologyEdexcelUnit: '', physicsUnit: '', mathUnit: '', religiousStudiesComponent: '', religiousStudiesUnit: '' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5"
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
                  onChange={(e) => setOptions({ ...options, englishExamType: e.target.value, examBoard: '', historyUnit: '', geographyUnit: '', geographySection: '', biologyUnit: '', chemistryUnit: '', biologyEdexcelUnit: '', physicsUnit: '', mathUnit: '', religiousStudiesComponent: '', religiousStudiesUnit: '' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5"
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
                    onChange={(e) => setOptions({ ...options, examBoard: e.target.value, historyUnit: '', geographyUnit: '', geographySection: '', biologyUnit: '', chemistryUnit: '', biologyEdexcelUnit: '', physicsUnit: '', mathUnit: '', religiousStudiesComponent: '', religiousStudiesUnit: '' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5"
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
                <h3 className="block text-base font-semibold text-gray-800 mb-4">
                  Select a History Unit
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  {getHistoryUnits().map((unit) => (
                    <button
                      key={unit.value}
                      type="button"
                      onClick={() => {
                        setOptions({ ...options, historyUnit: unit.value });
                        setSelectedTopic('');
                        setSearchTopic('');
                      }}
                      className={`p-3 text-left border-2 rounded-lg transition-all duration-200 h-20 flex flex-col justify-center ${
                        options.historyUnit === unit.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className={`text-sm font-semibold leading-tight ${
                        options.historyUnit === unit.value ? 'text-gray-900' : 'text-gray-800'
                      }`}>
                        {unit.title}
                      </div>
                      {unit.subtitle && (
                        <div className={`text-xs leading-tight mt-1 ${
                          options.historyUnit === unit.value ? 'text-gray-700' : 'text-gray-600'
                        }`}>
                          {unit.subtitle}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Geography Unit Selection - only for AQA GCSE Geography */}
            {normalizedSubject === 'geography' && options.examBoard === 'aqa' && (
              <div className="sm:col-span-3">
                <h3 className="block text-base font-semibold text-gray-800 mb-4">
                  Select a Geography Unit
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {getGeographyAqaUnits().map((unit) => (
                    <button
                      key={unit.value}
                      type="button"
                      onClick={() => {
                        setOptions({ ...options, geographyUnit: unit.value, geographySection: '', biologyUnit: '', chemistryUnit: '', biologyEdexcelUnit: '', physicsUnit: '', mathUnit: '', religiousStudiesComponent: '', religiousStudiesUnit: '' });
                        setSelectedTopic('');
                        setSearchTopic('');
                      }}
                      className={`p-4 text-left border-2 rounded-lg transition-all duration-200 min-h-20 flex flex-col justify-center ${
                        options.geographyUnit === unit.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className={`text-sm font-semibold leading-tight ${
                        options.geographyUnit === unit.value ? 'text-gray-900' : 'text-gray-800'
                      }`}>
                        {unit.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Geography Section Selection - only for AQA GCSE Geography with unit selected (except geographical-skills) */}
            {normalizedSubject === 'geography' && options.examBoard === 'aqa' && options.geographyUnit && options.geographyUnit !== 'geographical-skills' && (
              <div className="sm:col-span-3">
                <h3 className="block text-base font-semibold text-gray-800 mb-4">
                  Select a Geography Section
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getGeographyAqaSections(options.geographyUnit).map((section) => (
                    <button
                      key={section.value}
                      type="button"
                      onClick={() => {
                        setOptions({ ...options, geographySection: section.value });
                        setSelectedTopic('');
                        setSearchTopic('');
                      }}
                      className={`p-4 text-left border-2 rounded-lg transition-all duration-200 min-h-20 flex flex-col justify-center ${
                        options.geographySection === section.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className={`text-sm font-semibold leading-tight ${
                        options.geographySection === section.value ? 'text-gray-900' : 'text-gray-800'
                      }`}>
                        {section.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Biology Unit Selection - only for AQA GCSE Biology */}
            {normalizedSubject === 'biology' && options.examBoard === 'aqa' && (
              <div className="sm:col-span-3">
                <h3 className="block text-base font-semibold text-gray-800 mb-4">
                  Select a Biology Unit
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {getBiologyUnits().map((unit) => (
                    <button
                      key={unit.value}
                      type="button"
                      onClick={() => {
                        setOptions({ ...options, biologyUnit: unit.value });
                        setSelectedTopic('');
                        setSearchTopic('');
                      }}
                      className={`p-3 text-center border-2 rounded-lg transition-all duration-200 h-20 flex flex-col justify-center ${
                        options.biologyUnit === unit.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className={`text-xl font-bold ${
                        options.biologyUnit === unit.value ? 'text-blue-600' : 'text-blue-500'
                      }`}>
                        {unit.number}
                      </div>
                      <div className={`text-sm font-semibold leading-tight ${
                        options.biologyUnit === unit.value ? 'text-gray-900' : 'text-gray-800'
                      }`}>
                        {unit.title}
                      </div>
                      {unit.subtitle && (
                        <div className={`text-xs leading-tight ${
                          options.biologyUnit === unit.value ? 'text-gray-700' : 'text-gray-600'
                        }`}>
                          {unit.subtitle}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Biology Unit Selection - only for Edexcel GCSE Biology */}
            {normalizedSubject === 'biology' && options.examBoard === 'edexcel' && (
              <div className="sm:col-span-3">
                <h3 className="block text-base font-semibold text-gray-800 mb-4">
                  Select a Biology Unit
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {getBiologyEdexcelUnits().map((unit) => (
                    <button
                      key={unit.value}
                      type="button"
                      onClick={() => {
                        setOptions({ ...options, biologyEdexcelUnit: unit.value });
                        setSelectedTopic('');
                        setSearchTopic('');
                      }}
                      className={`p-3 text-center border-2 rounded-lg transition-all duration-200 h-20 flex flex-col justify-center ${
                        options.biologyEdexcelUnit === unit.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className={`text-xl font-bold ${
                        options.biologyEdexcelUnit === unit.value ? 'text-blue-600' : 'text-blue-500'
                      }`}>
                        {unit.number}
                      </div>
                      <div className={`text-sm font-semibold leading-tight ${
                        options.biologyEdexcelUnit === unit.value ? 'text-gray-900' : 'text-gray-800'
                      }`}>
                        {unit.title}
                      </div>
                      {unit.subtitle && (
                        <div className={`text-xs leading-tight ${
                          options.biologyEdexcelUnit === unit.value ? 'text-gray-700' : 'text-gray-600'
                        }`}>
                          {unit.subtitle}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mathematics Unit Selection - only for Edexcel GCSE Mathematics */}
            {normalizedSubject === 'mathematics' && options.examBoard === 'edexcel' && (
              <div className="sm:col-span-3">
                <h3 className="block text-base font-semibold text-gray-800 mb-4">
                  Select a Mathematics Unit
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { value: 'number', number: '1', title: 'Number' },
                    { value: 'algebra', number: '2', title: 'Algebra' },
                    { value: 'ratio-proportion-rates', number: '3', title: 'Ratio, Proportion', subtitle: 'and Rates of Change' },
                    { value: 'geometry-measures', number: '4', title: 'Geometry and Measures' },
                    { value: 'probability', number: '5', title: 'Probability' },
                    { value: 'statistics', number: '6', title: 'Statistics' }
                  ].map((unit) => (
                    <button
                      key={unit.value}
                      type="button"
                      onClick={() => {
                        setOptions({ ...options, mathUnit: unit.value });
                        setSelectedTopic('');
                        setSearchTopic('');
                      }}
                      className={`p-3 text-center border-2 rounded-lg transition-all duration-200 h-20 flex flex-col justify-center ${
                        options.mathUnit === unit.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className={`text-xl font-bold ${
                        options.mathUnit === unit.value ? 'text-blue-600' : 'text-blue-500'
                      }`}>
                        {unit.number}
                      </div>
                      <div className={`text-sm font-semibold leading-tight ${
                        options.mathUnit === unit.value ? 'text-gray-900' : 'text-gray-800'
                      }`}>
                        {unit.title}
                      </div>
                      {unit.subtitle && (
                        <div className={`text-xs leading-tight ${
                          options.mathUnit === unit.value ? 'text-gray-700' : 'text-gray-600'
                        }`}>
                          {unit.subtitle}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chemistry Unit Selection - only for AQA GCSE Chemistry */}
            {normalizedSubject === 'chemistry' && options.examBoard === 'aqa' && (
              <div className="sm:col-span-3">
                <h3 className="block text-base font-semibold text-gray-800 mb-4">
                  Select a Chemistry Unit
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {getChemistryUnits().map((unit) => (
                    <button
                      key={unit.value}
                      type="button"
                      onClick={() => {
                        setOptions({ ...options, chemistryUnit: unit.value });
                        setSelectedTopic('');
                        setSearchTopic('');
                      }}
                      className={`p-3 text-center border-2 rounded-lg transition-all duration-200 h-20 flex flex-col justify-center ${
                        options.chemistryUnit === unit.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className={`text-xl font-bold ${
                        options.chemistryUnit === unit.value ? 'text-blue-600' : 'text-blue-500'
                      }`}>
                        {unit.number}
                      </div>
                      <div className={`text-sm font-semibold leading-tight ${
                        options.chemistryUnit === unit.value ? 'text-gray-900' : 'text-gray-800'
                      }`}>
                        {unit.title}
                      </div>
                      {unit.subtitle && (
                        <div className={`text-xs leading-tight ${
                          options.chemistryUnit === unit.value ? 'text-gray-700' : 'text-gray-600'
                        }`}>
                          {unit.subtitle}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chemistry Unit Selection - only for Edexcel GCSE Chemistry */}
            {normalizedSubject === 'chemistry' && options.examBoard === 'edexcel' && (
              <div className="sm:col-span-3">
                <h3 className="block text-base font-semibold text-gray-800 mb-4">
                  Select a Chemistry Unit
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {getChemistryEdexcelUnits().map((unit) => (
                    <button
                      key={unit.value}
                      type="button"
                      onClick={() => {
                        setOptions({ ...options, chemistryEdexcelUnit: unit.value });
                        setSelectedTopic('');
                        setSearchTopic('');
                      }}
                      className={`p-3 text-center border-2 rounded-lg transition-all duration-200 h-20 flex flex-col justify-center ${
                        options.chemistryEdexcelUnit === unit.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className={`text-xl font-bold ${
                        options.chemistryEdexcelUnit === unit.value ? 'text-blue-600' : 'text-blue-500'
                      }`}>
                        {unit.number}
                      </div>
                      <div className={`text-sm font-semibold leading-tight ${
                        options.chemistryEdexcelUnit === unit.value ? 'text-gray-900' : 'text-gray-800'
                      }`}>
                        {unit.title}
                      </div>
                      {unit.subtitle && (
                        <div className={`text-xs leading-tight ${
                          options.chemistryEdexcelUnit === unit.value ? 'text-gray-700' : 'text-gray-600'
                        }`}>
                          {unit.subtitle}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Physics Unit Selection - only for AQA GCSE Physics */}
            {normalizedSubject === 'physics' && options.examBoard === 'aqa' && (
              <div className="sm:col-span-3">
                <h3 className="block text-base font-semibold text-gray-800 mb-4">
                  Select a Physics Unit
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getPhysicsUnits().map((unit) => (
                    <button
                      key={unit.value}
                      type="button"
                      onClick={() => {
                        setOptions({ ...options, physicsUnit: unit.value });
                        setSelectedTopic('');
                        setSearchTopic('');
                      }}
                      className={`p-3 text-center border-2 rounded-lg transition-all duration-200 h-20 flex flex-col justify-center ${
                        options.physicsUnit === unit.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className={`text-xl font-bold ${
                        options.physicsUnit === unit.value ? 'text-blue-600' : 'text-blue-500'
                      }`}>
                        {unit.number}
                      </div>
                      <div className={`text-sm font-semibold leading-tight ${
                        options.physicsUnit === unit.value ? 'text-gray-900' : 'text-gray-800'
                      }`}>
                        {unit.title}
                      </div>
                      {unit.subtitle && (
                        <div className={`text-xs leading-tight ${
                          options.physicsUnit === unit.value ? 'text-gray-700' : 'text-gray-600'
                        }`}>
                          {unit.subtitle}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Religious Studies Component Selection - only for AQA GCSE Religious Studies */}
            {normalizedSubject === 'religious studies' && options.examBoard === 'aqa' && (
              <div className="sm:col-span-3">
                <h3 className="block text-base font-semibold text-gray-800 mb-4">
                  Select a Religious Studies Component
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {getReligiousStudiesComponents().map((component) => (
                    <button
                      key={component.value}
                      type="button"
                      onClick={() => {
                        setOptions({ ...options, religiousStudiesComponent: component.value, religiousStudiesUnit: '' });
                        setSelectedTopic('');
                        setSearchTopic('');
                      }}
                      className={`p-3 text-center border-2 rounded-lg transition-all duration-200 h-20 flex flex-col justify-center ${
                        options.religiousStudiesComponent === component.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className={`text-xl font-bold ${
                        options.religiousStudiesComponent === component.value ? 'text-blue-600' : 'text-blue-500'
                      }`}>
                        {component.number}
                      </div>
                      <div className={`text-sm font-semibold leading-tight ${
                        options.religiousStudiesComponent === component.value ? 'text-gray-900' : 'text-gray-800'
                      }`}>
                        {component.title}
                      </div>
                      {component.subtitle && (
                        <div className={`text-xs leading-tight ${
                          options.religiousStudiesComponent === component.value ? 'text-gray-700' : 'text-gray-600'
                        }`}>
                          {component.subtitle}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Religious Studies Religion Selection - only for Component 1 */}
            {normalizedSubject === 'religious studies' && options.examBoard === 'aqa' && options.religiousStudiesComponent === 'component-1' && (
              <div className="sm:col-span-3">
                <h3 className="block text-base font-semibold text-gray-800 mb-4">
                  Select a Religion
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getReligiousStudiesReligions().map((religion) => (
                    <button
                      key={religion.value}
                      type="button"
                      onClick={() => {
                        setOptions({ ...options, religiousStudiesUnit: religion.value });
                        setSelectedTopic('');
                        setSearchTopic('');
                      }}
                      className={`p-4 text-center border-2 rounded-lg transition-all duration-200 h-20 flex flex-col justify-center ${
                        options.religiousStudiesUnit === religion.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className={`text-sm font-semibold leading-tight ${
                        options.religiousStudiesUnit === religion.value ? 'text-gray-900' : 'text-gray-800'
                      }`}>
                        {religion.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Religious Studies Theme Selection - only for Component 2 */}
            {normalizedSubject === 'religious studies' && options.examBoard === 'aqa' && options.religiousStudiesComponent === 'component-2' && (
              <div className="sm:col-span-3">
                <h3 className="block text-base font-semibold text-gray-800 mb-4">
                  Select a Theme
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  {getReligiousStudiesThemes().map((theme) => (
                    <button
                      key={theme.value}
                      type="button"
                      onClick={() => {
                        setOptions({ ...options, religiousStudiesUnit: theme.value });
                        setSelectedTopic('');
                        setSearchTopic('');
                      }}
                      className={`p-4 text-left border-2 rounded-lg transition-all duration-200 min-h-20 flex flex-col justify-center ${
                        options.religiousStudiesUnit === theme.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`text-xl font-bold mr-3 ${
                          options.religiousStudiesUnit === theme.value ? 'text-blue-600' : 'text-blue-500'
                        }`}>
                          {theme.code}
                        </div>
                        <div className={`text-sm font-semibold leading-tight ${
                          options.religiousStudiesUnit === theme.value ? 'text-gray-900' : 'text-gray-800'
                        }`}>
                          {theme.title}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5"
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
                  {shouldShowTopicGrid ? 'Search for a topic or select from below' : 'Type any topic you want to practice - the suggestions are just examples!'}
                </div>
              </div>
            </div>
            <div className="relative flex gap-2">
              <input
                type="text"
                id="topic"
                value={searchTopic}
                onChange={handleTopicInputChange}
                onFocus={handleTopicInputFocus}
                placeholder={shouldShowTopicGrid ? 'Search for a topic or select from below...' : placeholder}
                autoComplete="off"
                className="topic-search-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 !text-black !bg-white focus:!bg-white focus:!text-black px-3 py-2.5"
              />
              {(searchTopic || selectedTopic) && (
                <button
                  type="button"
                  onClick={handleClearTopic}
                  className="mt-1 px-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Clear
                </button>
              )}
              {!shouldShowTopicGrid && (
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
                  chemistryEdexcelUnit={options.chemistryEdexcelUnit}
                  biologyEdexcelUnit={options.biologyEdexcelUnit}
                  physicsUnit={options.physicsUnit}
                  mathUnit={options.mathUnit}
                  religiousStudiesComponent={options.religiousStudiesComponent}
                  religiousStudiesUnit={options.religiousStudiesUnit}
                />
              )}
            </div>
          </div>

          {/* Topic Grid for Religious Studies and Mathematics Edexcel */}
          {shouldShowTopicGrid && (
            <div>
              {filteredTopicsForDisplay.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">Showing {filteredTopicsForDisplay.length} topics</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {filteredTopicsForDisplay.map((topic: string, index: number) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleTopicSelect(topic)}
                        className={`p-4 text-left border rounded-lg transition-all duration-200 ${
                          selectedTopic === topic
                            ? `border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50`
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-sm text-gray-900">{topic}</span>
                        {selectedTopic === topic && (
                          <div className="mt-1 flex items-center">
                            <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-xs text-green-600 font-medium">Selected</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              ) : !searchTopic.trim() ? (
                <p className="text-gray-500 text-center py-8">
                  {normalizedSubject === 'religious studies' 
                    ? 'Please select a component and religion/theme first to see available topics.'
                    : normalizedSubject === 'mathematics'
                    ? 'Please select a mathematics unit first to see available topics.'
                    : normalizedSubject === 'biology'
                    ? 'Please select a biology unit first to see available topics.'
                    : normalizedSubject === 'physics'
                    ? 'Please select a physics unit first to see available topics.'
                    : normalizedSubject === 'geography'
                    ? 'Please select a geography unit and section first to see available topics.'
                    : normalizedSubject === 'history'
                    ? 'Please select a history unit first to see available topics.'
                    : 'Please select a chemistry unit first to see available topics.'
                  }
                </p>
              ) : null}

              {/* Selection status message - shows for both selected topics and custom topics */}
              {(selectedTopic || (searchTopic.trim() && !availableTopics.includes(searchTopic.trim()))) && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-800">
                      Selected: "<strong>{selectedTopic || searchTopic.trim()}</strong>". Click "Generate Questions" to continue.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-6 pt-4">
            <button
              type="submit"
              disabled={isGenerating || (shouldShowTopicGrid && !selectedTopic && !searchTopic.trim())}
              className={`flex-1 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                isGenerating || (shouldShowTopicGrid && !selectedTopic && !searchTopic.trim())
                  ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
                  : `text-gray-900 ${subjectTheme.bg} ${subjectTheme.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${subjectTheme.bg.replace('bg-', '')}`
              }`}
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
                    <div className="flex items-center gap-2">
                      {question.marks && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {question.marks} marks
                        </span>
                      )}
                      <div className="relative group">
                        <button
                          onClick={() => copyQuestionAsImage(index)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-gray-100"
                          title="Copy to clipboard"
                        >
                          {copiedQuestions.has(index) ? (
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          )}
                        </button>
                        <div className="absolute top-full right-0 mt-1 px-2 py-1 text-xs text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          {copiedQuestions.has(index) ? 'Copied!' : 'Copy to clipboard'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div id={`question-content-${index}`} className="bg-white p-4 rounded-md">
                    <p className="text-gray-800 mb-4">{cleanQuestion(question.question)}</p>
                    
                    {/* Display passage if it exists (for questions with passages) */}
                    {question.passage && (
                      <div className="mb-4 p-4 bg-gray-50 border-l-4 border-blue-500 rounded-md">
                        <h4 className="font-medium text-gray-900 mb-2">Extract:</h4>
                        <p className="text-gray-800 italic whitespace-pre-wrap">{question.passage}</p>
                      </div>
                    )}
                  </div>
                  
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
        
        {/* Disclaimer - Always at the bottom of content */}
        <div className="text-center mt-8 pb-4">
          <p className="text-xs text-gray-500">
            Practice Qs may make mistakes. Check with your specification.
          </p>
        </div>
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

      {/* Sticky Feedback Bar - shows after questions are generated */}
      <StickyFeedbackBar show={generatedQuestions.length > 0} />

    </div>
  );
};

export default QuestionGenerator;
