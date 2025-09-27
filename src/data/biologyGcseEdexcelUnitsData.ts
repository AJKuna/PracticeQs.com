import { biologyGcseEdexcelUnits } from './biologyGcseEdexcelUnits';

export interface BiologyEdexcelUnit {
  value: string;
  number: string;
  title: string;
  subtitle?: string;
}

// Get all biology units with their display information
export const getBiologyEdexcelUnits = (): BiologyEdexcelUnit[] => {
  return [
    { 
      value: 'key-concepts-biology', 
      number: '1', 
      title: 'Key concepts', 
      subtitle: 'in biology' 
    },
    { 
      value: 'cells-control', 
      number: '2', 
      title: 'Cells and control' 
    },
    { 
      value: 'genetics', 
      number: '3', 
      title: 'Genetics' 
    },
    { 
      value: 'natural-selection-genetic-modification', 
      number: '4', 
      title: 'Natural selection', 
      subtitle: 'and genetic modification' 
    },
    { 
      value: 'health-disease-medicines', 
      number: '5', 
      title: 'Health, disease', 
      subtitle: 'and medicines' 
    },
    { 
      value: 'plant-structures-functions', 
      number: '6', 
      title: 'Plant structures', 
      subtitle: 'and functions' 
    },
    { 
      value: 'animal-coordination-control-homeostasis', 
      number: '7', 
      title: 'Animal coordination', 
      subtitle: 'and homeostasis' 
    },
    { 
      value: 'exchange-transport-animals', 
      number: '8', 
      title: 'Exchange and transport', 
      subtitle: 'in animals' 
    },
    { 
      value: 'ecosystems-material-cycles', 
      number: '9', 
      title: 'Ecosystems and', 
      subtitle: 'material cycles' 
    },
    { 
      value: 'required-practicals', 
      number: '10', 
      title: 'Required Practicals' 
    }
  ];
};

// Get topics for a specific unit
export const getBiologyEdexcelTopics = (unitValue: string): string[] => {
  return biologyGcseEdexcelUnits[unitValue] || [];
};

// Export the units data for direct access
export const biologyGcseEdexcelUnitsData = biologyGcseEdexcelUnits;
