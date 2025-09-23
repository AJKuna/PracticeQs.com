import { physicsGcseAqaUnits } from './physicsGcseAqaUnits';

export const physicsGcseAqaUnitsData: { [key: string]: string[] } = physicsGcseAqaUnits;

// Helper function to get display names for physics units
export const getPhysicsUnitDisplayName = (unitKey: string): string => {
  const unitNames: { [key: string]: string } = {
    "energy": "1. Energy",
    "electricity": "2. Electricity", 
    "particle-model-matter": "3. Particle model of matter",
    "atomic-structure": "4. Atomic structure",
    "forces": "5. Forces",
    "waves": "6. Waves",
    "magnetism-electromagnetism": "7. Magnetism and electromagnetism",
    "space-physics": "8. Space physics (physics only)",
    "required-practicals": "9. Required Practicals"
  };
  return unitNames[unitKey] || unitKey;
};

// Get the physics units data for unit selection grid
export const getPhysicsUnits = () => {
  return [
    { value: 'energy', number: '1', title: 'Energy' },
    { value: 'electricity', number: '2', title: 'Electricity' },
    { value: 'particle-model-matter', number: '3', title: 'Particle model', subtitle: 'of matter' },
    { value: 'atomic-structure', number: '4', title: 'Atomic structure' },
    { value: 'forces', number: '5', title: 'Forces' },
    { value: 'waves', number: '6', title: 'Waves' },
    { value: 'magnetism-electromagnetism', number: '7', title: 'Magnetism and', subtitle: 'electromagnetism' },
    { value: 'space-physics', number: '8', title: 'Space physics', subtitle: '(physics only)' },
    { value: 'required-practicals', number: '9', title: 'Required Practicals' }
  ];
};
