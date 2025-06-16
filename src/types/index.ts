export type ExamType = 'general' | 'ks3' | 'gcse' | 'a-level' | 'university';

export type Subject = 
  | 'mathematics' 
  | 'english' 
  | 'biology' 
  | 'chemistry' 
  | 'physics' 
  | 'history' 
  | 'religious-studies';

export type Difficulty = 'mixed' | 'easy' | 'medium' | 'hard' | 'challenging';

export interface GenerationOptions {
  examType: ExamType;
  subject: Subject;
  difficulty: Difficulty;
  numberOfQuestions: number;
}

export interface Question {
  id: string;
  question: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'challenging';
}

export interface Solution {
  questionId: string;
  solution: string;
}