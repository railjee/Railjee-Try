import { useState, useEffect, useCallback } from 'preact/hooks';
import { formatTime, isTimeLow } from '@/lib/examUtils';
import { UseExamTimerProps, UseExamTimerReturn } from '@/lib/examTypes';

export function useExamTimer({ 
  initialTime, 
  isActive, 
  onTimeUp 
}: UseExamTimerProps): UseExamTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);

  // Update time when initialTime changes
  useEffect(() => {
    if (initialTime > 0) {
      setTimeRemaining(initialTime);
    }
  }, [initialTime]);

  // Timer countdown
  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeRemaining, onTimeUp]);

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isLowTime: isTimeLow(timeRemaining),
    setTimeRemaining
  };
}
