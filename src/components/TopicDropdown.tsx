import React, { useState, useEffect, useRef } from 'react';
import { mathGcseTopics } from '../data/mathGcseTopics.ts';
import { mathKs3Topics } from '../data/mathKs3Topics.ts';
import { biologyGcseAqaUnits } from '../data/biologyGcseAqaUnits.ts';
import { biologyGcseEdexcelUnits } from '../data/biologyGcseEdexcelUnits.ts';
import { chemistryGcseAqaUnits } from '../data/chemistryGcseAqaUnits.ts';
import { chemistryGcseEdexcelUnits } from '../data/chemistryGcseEdexcelUnits.ts';
import { chemistryGcseOcrATopics } from '../data/chemistryGcseOcrATopics.ts';
import { physicsGcseAqaUnits } from '../data/physicsGcseAqaUnits.ts';
import { physicsGcseEdexcelTopics } from '../data/physicsGcseEdexcelTopics.ts';
import { physicsGcseOcrTopics } from '../data/physicsGcseOcrTopics.ts';
import { computerScienceGcseAqaTopics } from '../data/computerScienceGcseAqaTopics.ts';
import { computerScienceGcseEdexcelTopics } from '../data/computerScienceGcseEdexcelTopics.ts';
import { historyGcseAqaTopics } from '../data/historyGcseAqaTopics.ts';
import { geographyGcseAqaTopics } from '../data/geographyGcseAqaTopics.ts';

interface TopicDropdownProps {
  searchTopic: string;
  onTopicSelect: (topic: string) => void;
  isVisible: boolean;
  subject: string;
  examLevel: string;
  examBoard: string;
  historyUnit?: string;
  geographyUnit?: string;
  geographySection?: string;
  biologyUnit?: string;
  chemistryUnit?: string;
  chemistryEdexcelUnit?: string;
  biologyEdexcelUnit?: string;
  physicsUnit?: string;
}

const TopicDropdown: React.FC<TopicDropdownProps> = ({
  searchTopic,
  onTopicSelect,
  isVisible,
  subject,
  examLevel,
  examBoard,
  historyUnit,
  geographyUnit,
  geographySection,
  biologyUnit,
  chemistryUnit,
  chemistryEdexcelUnit,
  biologyEdexcelUnit,
  physicsUnit
}) => {
  const [filteredTopics, setFilteredTopics] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine which topics to use based on subject, exam level, and exam board
  const getTopicsList = (): string[] => {
    // Normalize subject name to handle both hyphenated and space-separated formats
    const normalizedSubject = subject.replace(/-/g, ' ').toLowerCase();

    if (normalizedSubject === 'mathematics' && examLevel === 'ks3') {
      return mathKs3Topics;
    }
    if (normalizedSubject === 'mathematics' && examLevel === 'gcse') {
      return mathGcseTopics;
    }
    if (normalizedSubject === 'biology' && examLevel === 'gcse' && examBoard === 'aqa' && biologyUnit) {
      return biologyGcseAqaUnits[biologyUnit] || [];
    }
    if (normalizedSubject === 'biology' && examLevel === 'gcse' && examBoard === 'edexcel' && biologyEdexcelUnit) {
      return biologyGcseEdexcelUnits[biologyEdexcelUnit] || [];
    }
    if (normalizedSubject === 'chemistry' && examLevel === 'gcse' && examBoard === 'aqa' && chemistryUnit) {
      return chemistryGcseAqaUnits[chemistryUnit] || [];
    }
    if (normalizedSubject === 'chemistry' && examLevel === 'gcse' && examBoard === 'edexcel' && chemistryEdexcelUnit) {
      return chemistryGcseEdexcelUnits[chemistryEdexcelUnit] || [];
    }
    if (normalizedSubject === 'chemistry' && examLevel === 'gcse' && examBoard === 'ocr') {
      return chemistryGcseOcrATopics;
    }
    if (normalizedSubject === 'physics' && examLevel === 'gcse' && examBoard === 'aqa' && physicsUnit) {
      return physicsGcseAqaUnits[physicsUnit] || [];
    }
    if (normalizedSubject === 'physics' && examLevel === 'gcse' && examBoard === 'edexcel') {
      return physicsGcseEdexcelTopics;
    }
    if (normalizedSubject === 'physics' && examLevel === 'gcse' && examBoard === 'ocr') {
      return physicsGcseOcrTopics;
    }
    if (normalizedSubject === 'computer science' && examLevel === 'gcse' && examBoard === 'aqa') {
      return computerScienceGcseAqaTopics;
    }
    if (normalizedSubject === 'computer science' && examLevel === 'gcse' && examBoard === 'edexcel') {
      return computerScienceGcseEdexcelTopics;
    }
    if (normalizedSubject === 'history' && examLevel === 'gcse' && examBoard === 'aqa' && historyUnit) {
      return historyGcseAqaTopics[historyUnit] || [];
    }
    if (normalizedSubject === 'geography' && examLevel === 'gcse' && examBoard === 'aqa' && geographyUnit && geographySection) {
      const unitData = geographyGcseAqaTopics[geographyUnit];
      if (unitData && typeof unitData === 'object' && !Array.isArray(unitData)) {
        return unitData[geographySection] || [];
      }
      return [];
    }
    
    return [];
  };

  // Filter topics based on search input
  useEffect(() => {
    const shouldShowDropdown = isVisible && searchTopic.trim().length > 0;
    
    if (!shouldShowDropdown) {
      setFilteredTopics([]);
      return;
    }

    const topics = getTopicsList();
    const searchLower = searchTopic.toLowerCase();
    const filtered = topics.filter(topic => 
      topic.toLowerCase().includes(searchLower)
    ).slice(0, 10); // Limit to 10 suggestions

    setFilteredTopics(filtered);
    setHighlightedIndex(-1);
  }, [searchTopic, isVisible, subject, examLevel, examBoard, historyUnit, geographyUnit, geographySection, biologyUnit, chemistryUnit, biologyEdexcelUnit, physicsUnit]);

  // Handle keyboard navigation
  useEffect(() => {
    const shouldShowDropdown = isVisible && searchTopic.trim().length > 0;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!shouldShowDropdown || filteredTopics.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredTopics.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          if (highlightedIndex >= 0) {
            e.preventDefault();
            onTopicSelect(filteredTopics[highlightedIndex]);
          }
          break;
        case 'Escape':
          setFilteredTopics([]);
          setHighlightedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredTopics, highlightedIndex, onTopicSelect, isVisible, searchTopic]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFilteredTopics([]);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const shouldShowDropdown = isVisible && searchTopic.trim().length > 0;

  if (!shouldShowDropdown || filteredTopics.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto"
    >
      {filteredTopics.map((topic: string, index: number) => (
        <div
          key={topic}
          onClick={() => onTopicSelect(topic)}
          className={`px-4 py-2 cursor-pointer text-sm ${
            index === highlightedIndex
              ? 'bg-blue-100 text-blue-900'
              : 'text-gray-900 hover:bg-gray-100'
          }`}
          onMouseEnter={() => setHighlightedIndex(index)}
        >
          {topic}
        </div>
      ))}
      {filteredTopics.length > 0 && (
        <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
          Use ↑↓ to navigate, Enter to select, Esc to close
        </div>
      )}
    </div>
  );
};

export default TopicDropdown; 