import React, { useState, useEffect, useRef } from 'react';
import { mathGcseTopics } from '../data/mathGcseTopics';
import { biologyGcseAqaTopics } from '../data/biologyGcseAqaTopics';
import { biologyGcseEdexcelTopics } from '../data/biologyGcseEdexcelTopics';

interface TopicDropdownProps {
  searchTopic: string;
  onTopicSelect: (topic: string) => void;
  isVisible: boolean;
  subject: string;
  examLevel: string;
  examBoard: string;
}

const TopicDropdown: React.FC<TopicDropdownProps> = ({
  searchTopic,
  onTopicSelect,
  isVisible,
  subject,
  examLevel,
  examBoard
}) => {
  const [filteredTopics, setFilteredTopics] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine which topics to use based on subject, exam level, and exam board
  const getTopicsList = () => {
    if (subject === 'mathematics' && examLevel === 'gcse') {
      return mathGcseTopics;
    }
    if (subject === 'biology' && examLevel === 'gcse' && examBoard === 'aqa') {
      return biologyGcseAqaTopics;
    }
    if (subject === 'biology' && examLevel === 'gcse' && examBoard === 'edexcel') {
      return biologyGcseEdexcelTopics;
    }
    return [];
  };

  // Only show dropdown for supported combinations
  const shouldShowDropdown = getTopicsList().length > 0 && isVisible;

  useEffect(() => {
    if (!shouldShowDropdown || !searchTopic.trim()) {
      setFilteredTopics([]);
      setHighlightedIndex(-1);
      return;
    }

    const topicsList = getTopicsList();
    const filtered = topicsList.filter(topic =>
      topic.toLowerCase().includes(searchTopic.toLowerCase())
    ).slice(0, 8); // Limit to 8 suggestions to avoid overwhelming the user

    setFilteredTopics(filtered);
    setHighlightedIndex(-1);
  }, [searchTopic, shouldShowDropdown, subject, examLevel, examBoard]);

  // Handle keyboard navigation
  useEffect(() => {
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
  }, [filteredTopics, highlightedIndex, onTopicSelect, shouldShowDropdown]);

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

  if (!shouldShowDropdown || filteredTopics.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto"
    >
      {filteredTopics.map((topic, index) => (
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