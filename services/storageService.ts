import { QuizCategory, UserStats, AttemptRecord, CategoryStats } from '../types';

const getStorageKey = (email: string) => `vocab_master_stats_${email}`;

// Hardcoded Google Apps Script Web App URL
const SYNC_URL = 'https://script.google.com/macros/s/AKfycbyut9C6W8OohwKYDFQQHvBj5yQQ-vJHdvcQDyLA0RI0qTtnTazhLup1p3BA8TTf9YmB/exec';

const INITIAL_STATS: UserStats = {
  totalAttempts: 0,
  correctAttempts: 0,
  masteredWords: [],
  history: []
};

// Helper to fetch from Google Sheet
const fetchFromCloud = async (email: string): Promise<UserStats | null> => {
  if (!SYNC_URL) return null;

  try {
    const response = await fetch(`${SYNC_URL}?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error("Cloud fetch failed:", error);
    return null;
  }
};

// Helper to save to Google Sheet
const saveToCloud = async (email: string, stats: UserStats) => {
  if (!SYNC_URL) return;

  try {
    // We use text/plain to avoid CORS preflight options request issues with GAS
    await fetch(SYNC_URL, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({ email, data: stats })
    });
  } catch (error) {
    console.error("Cloud save failed:", error);
  }
};

export const getStats = async (email: string): Promise<UserStats> => {
  if (!email) return INITIAL_STATS;

  // 1. Try Local Storage first for immediate UI
  const localStored = localStorage.getItem(getStorageKey(email));
  let stats = localStored ? JSON.parse(localStored) : INITIAL_STATS;

  // 2. Try Cloud and update if successful (Sync Strategy: Maximize Data)
  const cloudStats = await fetchFromCloud(email);
  if (cloudStats) {
    // If cloud has more attempts, it means this device is behind. Sync down.
    if (cloudStats.totalAttempts > stats.totalAttempts) {
      console.log('Syncing down from cloud...', cloudStats);
      stats = cloudStats;
      localStorage.setItem(getStorageKey(email), JSON.stringify(stats));
    } 
    // If local has more attempts (e.g. offline play), push up to cloud.
    else if (stats.totalAttempts > cloudStats.totalAttempts) {
       console.log('Syncing up to cloud...');
       saveToCloud(email, stats);
    }
  }

  return stats;
};

export const saveAttempt = async (email: string, category: QuizCategory, targetWord: string, isCorrect: boolean) => {
  if (!email) return;
  
  // Get current state from local
  const localStored = localStorage.getItem(getStorageKey(email));
  const stats: UserStats = localStored ? JSON.parse(localStored) : { ...INITIAL_STATS }; 
  
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
    if (!stats.masteredWords.includes(targetWord)) {
      stats.masteredWords.push(targetWord);
    }
  }

  // Save Local
  localStorage.setItem(getStorageKey(email), JSON.stringify(stats));

  // Save Cloud (Fire and forget)
  saveToCloud(email, stats);
};

export const getMasteredWords = async (email: string): Promise<string[]> => {
  const stats = await getStats(email);
  return stats.masteredWords;
};

export const getCategoryStats = async (email: string): Promise<CategoryStats[]> => {
  const stats = await getStats(email);
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