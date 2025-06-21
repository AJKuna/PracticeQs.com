import type { Subject } from '../types';

const subjectKeywords: Record<Subject, string[]> = {
  mathematics: [
    'algebra', 'geometry', 'calculus', 'trigonometry', 'equations',
    'mathematics', 'math', 'maths', 'arithmetic', 'statistics',
    'probability', 'number', 'quadratic', 'linear', 'exponential'
  ],
  english: [
    'literature', 'poetry', 'shakespeare', 'writing', 'grammar',
    'english', 'language', 'novel', 'essay', 'comprehension',
    'reading', 'analysis', 'text', 'narrative', 'composition'
  ],
  biology: [
    'cell', 'evolution', 'genetics', 'organism', 'ecology',
    'biology', 'photosynthesis', 'respiration', 'enzyme', 'protein',
    'dna', 'reproduction', 'ecosystem', 'species', 'metabolism'
  ],
  chemistry: [
    'chemical', 'reaction', 'molecule', 'atom', 'periodic',
    'chemistry', 'acid', 'base', 'element', 'compound',
    'solution', 'bond', 'organic', 'inorganic', 'equilibrium'
  ],
  physics: [
    'force', 'energy', 'motion', 'electricity', 'magnetism',
    'physics', 'wave', 'light', 'heat', 'quantum',
    'mechanics', 'gravity', 'momentum', 'nuclear', 'thermodynamics'
  ],
  history: [
    'war', 'revolution', 'civilization', 'empire', 'century',
    'history', 'historical', 'ancient', 'medieval', 'modern',
    'world war', 'dynasty', 'period', 'era', 'movement'
  ],
  'religious-studies': [
    'religion', 'faith', 'belief', 'worship', 'god',
    'religious', 'sacred', 'spiritual', 'ritual', 'tradition',
    'scripture', 'theology', 'ethics', 'morality', 'philosophy'
  ]
};

export function detectSubject(topic: string): Subject {
  const normalizedTopic = topic.toLowerCase();
  
  // Check each subject's keywords for matches
  const matches = Object.entries(subjectKeywords).map(([subject, keywords]) => ({
    subject: subject as Subject,
    score: keywords.reduce((score, keyword) => 
      normalizedTopic.includes(keyword.toLowerCase()) ? score + 1 : score, 0
    )
  }));

  // Sort by score and get the highest scoring subject
  const bestMatch = matches.sort((a, b) => b.score - a.score)[0];
  
  // If no matches found, default to mathematics
  return bestMatch.score > 0 ? bestMatch.subject : 'mathematics';
}