import { chemistryGcseAqaUnits } from './chemistryGcseAqaUnits';

export const chemistryGcseAqaUnitsData: { [key: string]: string[] } = chemistryGcseAqaUnits;

// Helper function to get display names for chemistry units
export const getChemistryUnitDisplayName = (unitKey: string): string => {
  const unitNames: { [key: string]: string } = {
    "atomic-structure-periodic-table": "1. Atomic structure and the periodic table",
    "bonding-structure-properties": "2. Bonding, structure, and the properties of matter",
    "quantitative-chemistry": "3. Quantitative chemistry",
    "chemical-changes": "4. Chemical changes",
    "energy-changes": "5. Energy changes",
    "rate-extent-chemical-change": "6. The rate and extent of chemical change",
    "organic-chemistry": "7. Organic chemistry",
    "chemical-analysis": "8. Chemical analysis",
    "chemistry-atmosphere": "9. Chemistry of the atmosphere",
    "using-resources": "10. Using resources",
    "required-practicals": "11. Required Practicals"
  };
  return unitNames[unitKey] || unitKey;
};

// Get the chemistry units data for unit selection grid
export const getChemistryUnits = () => {
  return [
    { value: 'atomic-structure-periodic-table', number: '1', title: 'Atomic structure', subtitle: 'and the periodic table' },
    { value: 'bonding-structure-properties', number: '2', title: 'Bonding, structure,', subtitle: 'and properties of matter' },
    { value: 'quantitative-chemistry', number: '3', title: 'Quantitative chemistry' },
    { value: 'chemical-changes', number: '4', title: 'Chemical changes' },
    { value: 'energy-changes', number: '5', title: 'Energy changes' },
    { value: 'rate-extent-chemical-change', number: '6', title: 'Rate and extent', subtitle: 'of chemical change' },
    { value: 'organic-chemistry', number: '7', title: 'Organic chemistry' },
    { value: 'chemical-analysis', number: '8', title: 'Chemical analysis' },
    { value: 'chemistry-atmosphere', number: '9', title: 'Chemistry of', subtitle: 'the atmosphere' },
    { value: 'using-resources', number: '10', title: 'Using resources' },
    { value: 'required-practicals', number: '11', title: 'Required Practicals' }
  ];
};
