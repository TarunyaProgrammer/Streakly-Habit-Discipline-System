import { StreakPulse } from "./StreakPulse";
import { ProgressRing } from "./ProgressRing";

interface MobileHeaderProps {
  streak: number;
  dailyProgress: number; // 0-1
  shake?: boolean;
}

// Note: Fixed for standard mobile view
export const MobileHeader = ({
  streak,
  dailyProgress,
  shake,
}: MobileHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 h-16 px-4 flex items-center justify-between w-full">
      <div className="flex flex-col">
        <span className="text-xs text-muted font-medium uppercase tracking-wider">
          Streakly
        </span>
        <span className="text-sm font-bold text-text">Discipline Mirror</span>
      </div>

      <div className="flex items-center gap-4">
        <StreakPulse streak={streak} shake={shake} />
        <div className="relative w-8 h-8">
          <ProgressRing progress={dailyProgress} size={32} strokeWidth={4} />
        </div>
      </div>
    </header>
  );
};
