import { historyGcseAqaTopics } from './historyGcseAqaTopics';

export const historyGcseAqaUnitsData: { [key: string]: string[] } = historyGcseAqaTopics;

// Helper function to get display names for history units
export const getHistoryUnitDisplayName = (unitKey: string): string => {
  const unitNames: { [key: string]: string } = {
    "america-1840-1895": "America, 1840-1895: Expansion and consolidation",
    "germany-1890-1945": "Germany, 1890-1945: Democracy and dictatorship",
    "russia-1894-1945": "Russia, 1894-1945: Tsardom and communism",
    "america-1920-1973": "America, 1920-1973: Opportunity and inequality",
    "conflict-first-world-war": "Conflict and tension: The First World War, 1894–1918",
    "conflict-inter-war": "Conflict and tension: The inter-war years, 1918–1939",
    "conflict-east-west": "Conflict and tension between East and West, 1945–1972",
    "conflict-asia": "Conflict and tension in Asia, 1950–1975",
    "conflict-gulf-afghanistan": "Conflict and tension in the Gulf and Afghanistan, 1990–2009",
    "britain-health": "Britain: Health and the people: c1000 to the present day",
    "britain-power": "Britain: Power and the people: c1170 to the present day",
    "britain-migration": "Britain: Migration, empires and the people: c790 to the present day",
    "norman-england": "Norman England, c1066–c1100",
    "medieval-england": "Medieval England: the reign of Edward I, 1272–1307",
    "elizabethan-england": "Elizabethan England, c1568–1603",
    "restoration-england": "Restoration England, 1660–1685"
  };
  return unitNames[unitKey] || unitKey;
};

// Get the history units data for unit selection grid
export const getHistoryUnits = () => {
  return [
    { value: 'america-1840-1895', title: 'America, 1840-1895', subtitle: 'Expansion and consolidation' },
    { value: 'germany-1890-1945', title: 'Germany, 1890-1945', subtitle: 'Democracy and dictatorship' },
    { value: 'russia-1894-1945', title: 'Russia, 1894-1945', subtitle: 'Tsardom and communism' },
    { value: 'america-1920-1973', title: 'America, 1920-1973', subtitle: 'Opportunity and inequality' },
    { value: 'conflict-first-world-war', title: 'Conflict and tension', subtitle: 'The First World War, 1894–1918' },
    { value: 'conflict-inter-war', title: 'Conflict and tension', subtitle: 'The inter-war years, 1918–1939' },
    { value: 'conflict-east-west', title: 'Conflict and tension', subtitle: 'East and West, 1945–1972' },
    { value: 'conflict-asia', title: 'Conflict and tension', subtitle: 'in Asia, 1950–1975' },
    { value: 'conflict-gulf-afghanistan', title: 'Conflict and tension', subtitle: 'Gulf and Afghanistan, 1990–2009' },
    { value: 'britain-health', title: 'Britain: Health', subtitle: 'c1000 to the present day' },
    { value: 'britain-power', title: 'Britain: Power', subtitle: 'c1170 to the present day' },
    { value: 'britain-migration', title: 'Britain: Migration', subtitle: 'c790 to the present day' },
    { value: 'norman-england', title: 'Norman England', subtitle: 'c1066–c1100' },
    { value: 'medieval-england', title: 'Medieval England', subtitle: 'Edward I, 1272–1307' },
    { value: 'elizabethan-england', title: 'Elizabethan England', subtitle: 'c1568–1603' },
    { value: 'restoration-england', title: 'Restoration England', subtitle: '1660–1685' }
  ];
};
