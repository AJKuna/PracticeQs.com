import React from 'react';
import { ExamType, Difficulty, GenerationOptions } from '../types';

interface OptionsSelectorProps {
  options: GenerationOptions;
  onOptionsChange: (options: GenerationOptions) => void;
}

const examTypes: { value: ExamType; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'ks3', label: 'Key Stage 3' },
  { value: 'gcse', label: 'GCSE' },
  { value: 'a-level', label: 'A Level' },
  { value: 'university', label: 'University' },
];

const difficulties: { value: Difficulty; label: string }[] = [
  { value: 'mixed', label: 'Mixed' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'challenging', label: 'Challenging' },
];

const OptionsSelector: React.FC<OptionsSelectorProps> = ({ options, onOptionsChange }) => {
  const handleChange = (field: keyof GenerationOptions, value: string | number) => {
    onOptionsChange({
      ...options,
      [field]: value,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Exam Type
        </label>
        <select
          value={options.examType}
          onChange={(e) => handleChange('examType', e.target.value as ExamType)}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {examTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Difficulty
        </label>
        <select
          value={options.difficulty}
          onChange={(e) => handleChange('difficulty', e.target.value as Difficulty)}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {difficulties.map((difficulty) => (
            <option key={difficulty.value} value={difficulty.value}>
              {difficulty.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Number of Questions
        </label>
        <input
          type="number"
          min="1"
          max="20"
          value={options.numberOfQuestions}
          onChange={(e) => handleChange('numberOfQuestions', Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default OptionsSelector;