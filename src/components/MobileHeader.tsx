import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { StreakPulse } from "./StreakPulse";
import { ProgressRing } from "./ProgressRing";

interface MobileHeaderProps {
  streak: number;
  dailyProgress: number; // 0-1
  shake?: boolean;
  onOpenTrophyRoom: () => void;
}

// Note: Fixed for standard mobile view
export const MobileHeader = ({
  streak,
  dailyProgress,
  shake,
  onOpenTrophyRoom,
}: MobileHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 h-16 px-4 flex items-center justify-between w-full">
      <div className="flex flex-col">
        <span className="text-xs text-muted font-medium uppercase tracking-wider">
          Streakly
        </span>
        <div className="flex items-center gap-2">
          <StreakPulse streak={streak} shake={shake} />
          <span className="font-bold text-lg text-white tabular-nums">
            {streak}{" "}
            <span className="text-sm font-normal text-muted">day streak</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8">
          <ProgressRing progress={dailyProgress} size={32} strokeWidth={4} />
        </div>
        <div className="flex bg-elevated rounded-full p-1 border border-border/50">
          {/* Trophy Icon */}
          <button
            onClick={onOpenTrophyRoom}
            className="rounded-full w-8 h-8 flex items-center justify-center text-muted hover:text-yellow-400 transition-colors"
          >
            <LucideIcons.Trophy className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
