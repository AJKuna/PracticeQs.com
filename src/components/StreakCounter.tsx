import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { getUserStreak, StreakData } from '../services/streakService';
import { useAuth } from '../contexts/AuthContext';

interface StreakCounterProps {
  className?: string;
  onStreakUpdate?: (streakData: StreakData) => void;
}

export interface StreakCounterRef {
  refresh: () => Promise<void>;
}

const StreakCounter = forwardRef<StreakCounterRef, StreakCounterProps>(({ className = '', onStreakUpdate }, ref) => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    lastPracticeDate: null,
    hasGeneratedToday: false,
    shouldShowPopup: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const fetchStreakData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await getUserStreak(user.id);
      if (response.success && response.data) {
        const newStreakData = response.data;
        
        // Check if streak increased (for animation)
        if (newStreakData.currentStreak > streakData.currentStreak && streakData.currentStreak > 0) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 1000);
        }
        
        setStreakData(newStreakData);
        onStreakUpdate?.(newStreakData);
      }
    } catch (error) {
      console.error('Error fetching streak data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch streak data on component mount and when user changes
  useEffect(() => {
    fetchStreakData();
  }, [user?.id]);

  // Refresh streak data when called from parent
  const refreshStreak = async () => {
    await fetchStreakData();
  };

  // Expose refresh method to parent components via ref
  useImperativeHandle(ref, () => ({
    refresh: refreshStreak
  }));

  if (isLoading || !user) {
    return null;
  }

  // Remove unused variable

  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium transition-all duration-300 transform ${
        isAnimating ? 'scale-110 bg-green-200 animate-pulse' : ''
      } ${className}`}
    >
      <span className="text-lg" role="img" aria-label="brain">🧠</span>
      <span className="font-semibold whitespace-nowrap">
        {streakData.currentStreak === 0 ? 'Start Streak' : 
         streakData.currentStreak === 1 ? 'Day 1' : 
         `${streakData.currentStreak} Days`}
      </span>
      

    </div>
  );
});

StreakCounter.displayName = 'StreakCounter';

export default StreakCounter;
