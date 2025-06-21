import React from 'react';
import type { ExamType } from '../types';

interface ExamTypeSelectorProps {
  examType: ExamType;
  onExamTypeChange: (examType: ExamType) => void;
}

const examTypes: { value: ExamType; label: string }[] = [
  { value: 'gcse', label: 'GCSE' },
  { value: 'ks3', label: 'KS3' },
  { value: 'a-level', label: 'A-Level' },
  { value: 'university', label: 'University' },
];

const ExamTypeSelector: React.FC<ExamTypeSelectorProps> = ({ 
  examType, 
  onExamTypeChange 
}) => {
  return (
    <div className="w-full">
      <label htmlFor="exam-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Exam Type
      </label>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {examTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onExamTypeChange(type.value)}
            className={`py-2 px-3 rounded-md text-sm font-medium transition-colors
              ${examType === type.value
                ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600'
              } border`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExamTypeSelector;