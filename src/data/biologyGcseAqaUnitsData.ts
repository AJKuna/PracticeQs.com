import { biologyGcseAqaUnits } from './biologyGcseAqaUnits';

export const biologyGcseAqaUnitsData: { [key: string]: string[] } = biologyGcseAqaUnits;

// Helper function to get display names for biology units
export const getBiologyUnitDisplayName = (unitKey: string): string => {
  const unitNames: { [key: string]: string } = {
    "cell-biology": "1. Cell biology",
    "organisation": "2. Organisation", 
    "infection-response": "3. Infection and response",
    "bioenergetics": "4. Bioenergetics",
    "homeostasis-response": "5. Homeostasis and response",
    "inheritance-variation-evolution": "6. Inheritance, variation and evolution",
    "ecology": "7. Ecology",
    "required-practicals": "8. Required Practicals"
  };
  return unitNames[unitKey] || unitKey;
};

// Get the biology units data for unit selection grid
export const getBiologyUnits = () => {
  return [
    { value: 'cell-biology', number: '1', title: 'Cell biology' },
    { value: 'organisation', number: '2', title: 'Organisation' },
    { value: 'infection-response', number: '3', title: 'Infection and response' },
    { value: 'bioenergetics', number: '4', title: 'Bioenergetics' },
    { value: 'homeostasis-response', number: '5', title: 'Homeostasis and response' },
    { value: 'inheritance-variation-evolution', number: '6', title: 'Inheritance, variation', subtitle: 'and evolution' },
    { value: 'ecology', number: '7', title: 'Ecology' },
    { value: 'required-practicals', number: '8', title: 'Required Practicals' }
  ];
};
