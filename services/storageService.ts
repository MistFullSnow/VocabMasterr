import { QuizCategory, UserStats, AttemptRecord, CategoryStats } from '../types';

// We use a dynamic key based on the user's email to support multiple profiles
const getStorageKey = (email: string) => `vocab_master_stats_${email}`;

const INITIAL_STATS: UserStats = {
  totalAttempts: 0,
  correctAttempts: 0,
  masteredWords: [],
  history: []
};

// Helper to simulate network delay for "Cloud" feel, removed for responsiveness but kept in mind
// In a real app, these would be async calls to Supabase/Firebase

export const getStats = (email: string): UserStats => {
  if (!email) return INITIAL_STATS;
  const stored = localStorage.getItem(getStorageKey(email));
  return stored ? JSON.parse(stored) : INITIAL_STATS;
};

export const saveAttempt = (email: string, category: QuizCategory, targetWord: string, isCorrect: boolean) => {
  if (!email) return;
  
  const stats = getStats(email);
  
  const newRecord: AttemptRecord = {
    timestamp: Date.now(),
    category,
    targetWord,
    isCorrect
  };

  stats.history.push(newRecord);
  stats.totalAttempts += 1;
  
  if (isCorrect) {
    stats.correctAttempts += 1;
    // Avoid duplicates
    if (!stats.masteredWords.includes(targetWord)) {
      stats.masteredWords.push(targetWord);
    }
  }

  localStorage.setItem(getStorageKey(email), JSON.stringify(stats));
  
  // TODO: For cross-device sync, replace the line above with a DB call:
  // await db.collection('users').doc(email).set(stats);
};

export const getMasteredWords = (email: string): string[] => {
  return getStats(email).masteredWords;
};

export const getCategoryStats = (email: string): CategoryStats[] => {
  const stats = getStats(email);
  const categories = Object.values(QuizCategory);
  
  return categories.map(cat => {
    const catHistory = stats.history.filter(h => h.category === cat);
    const attempts = catHistory.length;
    const correct = catHistory.filter(h => h.isCorrect).length;
    
    return {
      category: cat,
      attempts,
      accuracy: attempts > 0 ? (correct / attempts) * 100 : 0
    };
  });
};

export const clearData = (email: string) => {
  if (!email) return;
  localStorage.removeItem(getStorageKey(email));
  window.location.reload();
};