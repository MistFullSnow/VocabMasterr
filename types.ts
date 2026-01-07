export enum QuizCategory {
  SYNONYMS = 'Synonyms',
  ANTONYMS = 'Antonyms',
  IDIOMS = 'Idioms',
  CLOZE = 'Cloze Test',
  ONE_WORD = 'One Word Substitution',
  SPOT_ERROR = 'Spot the Error',
  SENTENCE_ARRANGEMENT = 'Sentence Arrangement',
  POSSIBLE_STARTERS = 'Possible Starters'
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium (CET Level)',
  HARD = 'Hard'
}

export interface Question {
  id: string;
  type: QuizCategory;
  targetWord: string; // The word being tested (or the idiom)
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint: string; // New field for gamification
}

export interface UserProfile {
  email: string;
  name?: string;
}

export interface UserStats {
  totalAttempts: number;
  correctAttempts: number;
  masteredWords: string[]; // List of targetWords answered correctly
  history: AttemptRecord[];
}

export interface AttemptRecord {
  timestamp: number;
  category: QuizCategory;
  targetWord: string;
  isCorrect: boolean;
}

export interface CategoryStats {
  category: QuizCategory;
  attempts: number;
  accuracy: number;
}