import { geographyGcseAqaTopics } from './geographyGcseAqaTopics';

export interface GeographyAqaUnit {
  value: string;
  title: string;
  sections?: GeographyAqaSection[];
}

export interface GeographyAqaSection {
  value: string;
  title: string;
}

// Get all geography units with their display information
export const getGeographyAqaUnits = (): GeographyAqaUnit[] => {
  return [
    { 
      value: 'living-physical-environment', 
      title: 'Living with the physical environment',
      sections: [
        { value: 'challenge-natural-hazards', title: 'The Challenge of Natural Hazards' },
        { value: 'living-world', title: 'The Living World' },
        { value: 'physical-landscapes-uk', title: 'Physical Landscapes in the UK' }
      ]
    },
    { 
      value: 'human-environment-challenges', 
      title: 'Challenges in the human environment',
      sections: [
        { value: 'urban-issues-challenges', title: 'Urban Issues and Challenges' },
        { value: 'changing-economic-world', title: 'The Changing Economic World' },
        { value: 'challenge-resource-management', title: 'The Challenge of Resource Management' }
      ]
    },
    { 
      value: 'geographical-applications-fieldwork', 
      title: 'Geographical applications (Fieldwork)',
      sections: [
        { value: 'issue-evaluation', title: 'Issue Evaluation' },
        { value: 'fieldwork', title: 'Fieldwork' }
      ]
    },
    { 
      value: 'geographical-skills', 
      title: 'Geographical skills'
      // No sections for geographical-skills, it's a standalone unit
    }
  ];
};

// Get sections for a specific unit
export const getGeographyAqaSections = (unitValue: string): GeographyAqaSection[] => {
  const unit = getGeographyAqaUnits().find(u => u.value === unitValue);
  return unit?.sections || [];
};

// Get topics for a specific unit and section (or just unit for geographical-skills)
export const getGeographyAqaTopics = (unitValue: string, sectionValue?: string): string[] => {
  const unitData = geographyGcseAqaTopics[unitValue];
  
  if (!unitData) return [];
  
  // For geographical-skills, return topics directly as it's an array
  if (Array.isArray(unitData)) {
    return unitData;
  }
  
  // For other units, get topics from the specific section
  if (sectionValue && typeof unitData === 'object') {
    return unitData[sectionValue] || [];
  }
  
  return [];
};

// Export the units data for direct access
export const geographyGcseAqaUnitsData = geographyGcseAqaTopics;
