import { API_CONFIG } from '../config/api';

export interface StreakData {
  currentStreak: number;
  lastPracticeDate: string | null;
  hasGeneratedToday: boolean;
  shouldShowPopup: boolean;
}

export interface StreakResponse {
  success: boolean;
  data?: StreakData;
  error?: string;
}

// These helper functions are now implemented in the backend

// Get user's current streak data
export const getUserStreak = async (userId: string): Promise<StreakResponse> => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const response = await fetch(API_CONFIG.ENDPOINTS.STREAK(userId));
    
    if (!response.ok) {
      throw new Error('Failed to fetch streak data');
    }

    const streakData = await response.json();

    return {
      success: true,
      data: {
        currentStreak: streakData.currentStreak,
        lastPracticeDate: streakData.lastPracticeDate,
        hasGeneratedToday: streakData.hasGeneratedToday,
        shouldShowPopup: streakData.shouldShowPopup
      }
    };

  } catch (error) {
    console.error('Error in getUserStreak:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

// Update streak when user generates their first question of the day
export const updateStreakOnGeneration = async (userId: string): Promise<StreakResponse> => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // Since the usage logs are automatically updated by the question generation endpoint,
    // we just need to fetch the updated streak data
    const response = await fetch(API_CONFIG.ENDPOINTS.STREAK(userId));
    
    if (!response.ok) {
      throw new Error('Failed to fetch updated streak data');
    }

    const streakData = await response.json();

    return {
      success: true,
      data: {
        currentStreak: streakData.currentStreak,
        lastPracticeDate: streakData.lastPracticeDate,
        hasGeneratedToday: streakData.hasGeneratedToday,
        shouldShowPopup: false // Don't show popup after generation
      }
    };

  } catch (error) {
    console.error('Error in updateStreakOnGeneration:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

// Get formatted streak text for display
export const getStreakDisplayText = (streak: number): string => {
  if (streak === 0) {
    return '🧠 Start Streak';
  } else if (streak === 1) {
    return '🧠 Day 1';
  } else {
    return `🧠 ${streak} Days`;
  }
};

// Check if user should see the streak popup after generating questions
export const shouldShowStreakPopup = async (userId: string): Promise<boolean> => {
  try {
    const streakResponse = await getUserStreak(userId);
    return streakResponse.success && streakResponse.data?.shouldShowPopup || false;
  } catch (error) {
    console.error('Error checking if should show popup:', error);
    return false;
  }
};
