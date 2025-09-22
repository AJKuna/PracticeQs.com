import { chemistryGcseEdexcelUnits } from './chemistryGcseEdexcelUnits';

// Unit structure with display information
export interface ChemistryEdexcelUnit {
  value: string;
  number: string;
  title: string;
  subtitle?: string;
}

// Get all chemistry units with their display information
export const getChemistryEdexcelUnits = (): ChemistryEdexcelUnit[] => {
  return [
    { 
      value: 'key-concepts-chemistry', 
      number: '1', 
      title: 'Key concepts', 
      subtitle: 'in chemistry' 
    },
    { 
      value: 'states-matter-mixtures', 
      number: '2', 
      title: 'States of matter', 
      subtitle: 'and mixtures' 
    },
    { 
      value: 'chemical-changes', 
      number: '3', 
      title: 'Chemical changes' 
    },
    { 
      value: 'extracting-metals-equilibria', 
      number: '4', 
      title: 'Extracting metals', 
      subtitle: 'and equilibria' 
    },
    { 
      value: 'separate-chemistry-1', 
      number: '5', 
      title: 'Separate chemistry 1' 
    },
    { 
      value: 'groups-periodic-table', 
      number: '6', 
      title: 'Groups in the', 
      subtitle: 'periodic table' 
    },
    { 
      value: 'rates-reaction-energy-changes', 
      number: '7', 
      title: 'Rates of reaction', 
      subtitle: 'and energy changes' 
    },
    { 
      value: 'fuels-earth-science', 
      number: '8', 
      title: 'Fuels and', 
      subtitle: 'Earth science' 
    },
    { 
      value: 'separate-chemistry-2', 
      number: '9', 
      title: 'Separate chemistry 2' 
    },
    { 
      value: 'core-practicals', 
      number: '10', 
      title: 'Core Practicals' 
    }
  ];
};

// Get topics for a specific unit
export const getChemistryEdexcelTopics = (unitValue: string): string[] => {
  return chemistryGcseEdexcelUnits[unitValue] || [];
};

// Export the units data for direct access
export const chemistryGcseEdexcelUnitsData = chemistryGcseEdexcelUnits;
