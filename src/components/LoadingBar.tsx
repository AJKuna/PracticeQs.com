import { useState, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import { Brain, Sparkles, FileText, CheckCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface LoadingBarProps {
  onCancel: () => void;
  isVisible: boolean;
}

interface LoadingBarRef {
  complete: () => void;
}

interface ProgressStep {
  id: string;
  text: string;
  icon: LucideIcon;
  maxProgress: number; // Max progress percentage for this step
}

const LoadingBar = forwardRef<LoadingBarRef, LoadingBarProps>(({ onCancel, isVisible }, ref) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const steps: ProgressStep[] = useMemo(() => [
    {
      id: 'analyzing',
      text: 'Analyzing exam specification...',
      icon: Brain,
      maxProgress: 25
    },
    {
      id: 'generating',
      text: 'Generating questions with AI...',
      icon: Sparkles,
      maxProgress: 85
    },
    {
      id: 'formatting',
      text: 'Formatting questions...',
      icon: FileText,
      maxProgress: 95
    },
    {
      id: 'complete',
      text: 'Complete!',
      icon: CheckCircle,
      maxProgress: 100
    }
  ], []);

  useEffect(() => {
    if (!isVisible) {
      // Reset state when not visible
      setCurrentStep(0);
      setProgress(0);
      setIsComplete(false);
      return;
    }

    let progressInterval: NodeJS.Timeout;
    const startTime = Date.now();

    const updateProgress = () => {
      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const seconds = elapsed / 1000;
        
        // Determine current step and progress based on elapsed time
        let newCurrentStep = 0;
        let targetProgress = 0;
        
        if (seconds < 2) {
          // First 2 seconds: Analyzing (0% to 25%)
          newCurrentStep = 0;
          targetProgress = (seconds / 2) * 25;
        } else if (seconds < 8) {
          // Next 6 seconds: Generating (25% to 85%)
          newCurrentStep = 1;
          targetProgress = 25 + ((seconds - 2) / 6) * 60;
        } else if (seconds < 10) {
          // Next 2 seconds: Formatting (85% to 95%)
          newCurrentStep = 2;
          targetProgress = 85 + ((seconds - 8) / 2) * 10;
        } else {
          // After 10 seconds: Slow down, wait for API completion
          newCurrentStep = 2;
          targetProgress = Math.min(95 + ((seconds - 10) / 10) * 4, 99);
        }
        
        setCurrentStep(newCurrentStep);
        setProgress(Math.min(targetProgress, 99));
      }, 100);
    };

    updateProgress();

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isVisible]);

  // Function to complete the loading bar (called when API completes)
  const completeProgress = () => {
    setCurrentStep(3);
    setProgress(100);
    setIsComplete(true);
  };

  // Expose completeProgress function to parent component
  useImperativeHandle(ref, () => ({
    complete: completeProgress
  }));

  if (!isVisible) return null;

  const CurrentIcon = steps[currentStep]?.icon || Brain;

  return (
    <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <CurrentIcon 
              className={`w-5 h-5 text-blue-600 ${!isComplete ? 'animate-pulse' : ''}`}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">
              {steps[currentStep]?.text || 'Processing...'}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              {Math.round(progress)}% complete
            </p>
          </div>
        </div>
        
        {!isComplete && (
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-md transition-colors duration-200"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-blue-100 rounded-full h-2 mb-3">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between items-center text-xs text-blue-600">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`flex items-center gap-1 ${
              index <= currentStep ? 'text-blue-700' : 'text-blue-400'
            }`}
          >
            <step.icon className="w-3 h-3" />
            <span className="hidden sm:inline">{step.text.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

LoadingBar.displayName = 'LoadingBar';

export default LoadingBar; 