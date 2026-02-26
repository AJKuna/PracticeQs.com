import React, { useState, useEffect } from 'react';

interface CollapsibleUnitProps {
  unitNumber?: string;
  unitTitle: string;
  unitSubtitle?: string;
  topics: string[];
  selectedTopic: string;
  onTopicSelect: (topic: string) => void;
  searchQuery?: string;
  defaultExpanded?: boolean;
}

const CollapsibleUnit: React.FC<CollapsibleUnitProps> = ({
  unitNumber,
  unitTitle,
  unitSubtitle,
  topics,
  selectedTopic,
  onTopicSelect,
  searchQuery = '',
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Filter topics based on search query
  const filteredTopics = searchQuery.trim()
    ? topics.filter(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
    : topics;

  // Auto-expand if search matches topics in this unit
  useEffect(() => {
    if (searchQuery.trim() && filteredTopics.length > 0) {
      setIsExpanded(true);
    }
  }, [searchQuery, filteredTopics.length]);

  // Don't render if no topics match search
  if (searchQuery.trim() && filteredTopics.length === 0) {
    return null;
  }

  const topicCount = topics.length;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Unit Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150"
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          {unitNumber && (
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
              {unitNumber}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-gray-900">
                {unitTitle}{unitSubtitle && ` ${unitSubtitle}`}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                {topicCount} {topicCount === 1 ? 'topic' : 'topics'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 ml-4">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Topics List */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="px-4 py-2">
            {filteredTopics.map((topic, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onTopicSelect(topic)}
                className={`w-full text-left px-3 py-2.5 rounded-md mb-1 transition-all duration-150 ${
                  selectedTopic === topic
                    ? 'bg-blue-500 text-white font-medium shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="text-sm">{topic}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollapsibleUnit;
