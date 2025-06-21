import React from 'react';
import { FilePlus } from 'lucide-react';
import type { Question } from '../types';

interface ResultsDisplayProps {
  questions: Question[];
  onGenerateSolutions: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  questions, 
  onGenerateSolutions 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium text-gray-800 dark:text-white">Generated Questions</h2>
        <div className="flex space-x-2">
          <button
            onClick={onGenerateSolutions}
            className="flex items-center space-x-1 py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FilePlus className="w-4 h-4" />
            <span>Generate Solutions</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div 
            key={index} 
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                Question {index + 1}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{question.question}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsDisplay;