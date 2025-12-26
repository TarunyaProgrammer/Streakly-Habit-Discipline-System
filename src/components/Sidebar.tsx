import { motion } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight, Trophy, Flame } from "lucide-react";
import { ProgressRing } from "./ProgressRing";
import { cn } from "../utils/cn";

interface SidebarProps {
  streak: number;
  dailyProgress: number;
  viewMonthLabel: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onAddHabit: () => void;
  onOpenTrophyRoom: () => void;
  className?: string;
}

export const Sidebar = ({
  streak,
  dailyProgress,
  viewMonthLabel,
  onPrevMonth,
  onNextMonth,
  onAddHabit,
  onOpenTrophyRoom,
  className,
}: SidebarProps) => {
  return (
    <aside
      className={cn(
        "flex-col w-64 h-screen bg-surface border-r border-border/50 sticky top-0 p-6 hidden md:flex",
        className
      )}
    >
      {/* Brand */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-muted bg-clip-text text-transparent">
          Streakly
        </h1>
        <p className="text-xs text-muted font-medium uppercase tracking-wider mt-1">
          Discipline Mirror
        </p>
      </div>

      {/* Stats Card */}
      <div className="bg-background/50 rounded-xl p-4 border border-border/50 mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame
              className={cn(
                "w-5 h-5",
                streak > 0 ? "text-orange-500" : "text-muted"
              )}
            />
            <span className="text-sm font-medium text-text">Streak</span>
          </div>
          <span className="text-xl font-bold text-white">{streak}</span>
        </div>

        <div className="h-px bg-border/50 w-full" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy
              className={cn(
                "w-5 h-5",
                dailyProgress >= 1 ? "text-yellow-500" : "text-muted"
              )}
            />
            <span className="text-sm font-medium text-text">Daily</span>
          </div>
          <div className="relative w-8 h-8">
            <ProgressRing progress={dailyProgress} size={32} strokeWidth={4} />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="space-y-4 mb-auto">
        <h3 className="text-xs font-bold text-muted uppercase tracking-wider">
          Navigation
        </h3>
        <button
          onClick={onOpenTrophyRoom}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-elevated transition-colors text-text group"
        >
          <Trophy className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Trophy Room</span>
        </button>

        <div className="flex items-center justify-between bg-elevated rounded-lg p-2 border border-border/30">
          <button
            onClick={onPrevMonth}
            className="p-1 hover:bg-surface rounded-md text-muted hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-text tabular-nums">
            {viewMonthLabel}
          </span>
          <button
            onClick={onNextMonth}
            className="p-1 hover:bg-surface rounded-md text-muted hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Add Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAddHabit}
        className="w-full py-3 bg-today text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 hover:bg-today/90 transition-colors"
      >
        <Plus className="w-5 h-5" strokeWidth={3} />
        New Protocol
      </motion.button>
    </aside>
  );
};
