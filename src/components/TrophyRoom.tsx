import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock } from "lucide-react";
import { Badge } from "./Badge";
import {
  ACHIEVEMENTS,
  type Tier,
  type AchievementDef,
} from "../utils/achievements";
import { cn } from "../utils/cn";

interface TrophyRoomProps {
  unlockedIds: Set<string>;
  onClose: () => void;
}

export const TrophyRoom = ({ unlockedIds, onClose }: TrophyRoomProps) => {
  const [filter, setFilter] = useState<Tier | "all">("all");
  const [selectedAchievement, setSelectedAchievement] =
    useState<AchievementDef | null>(null);

  const filteredAchievements = useMemo(() => {
    if (filter === "all") return ACHIEVEMENTS;
    return ACHIEVEMENTS.filter((a) => a.tier === filter);
  }, [filter]);

  const stats = useMemo(() => {
    const total = ACHIEVEMENTS.length;
    const unlocked = unlockedIds.size;
    const percentage = Math.round((unlocked / total) * 100);
    return { total, unlocked, percentage };
  }, [unlockedIds]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-50 bg-background flex flex-col md:max-w-4xl md:mx-auto md:border-x md:border-border/30 md:shadow-2xl md:relative md:h-screen"
    >
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-text">Trophy Room</h1>
          <p className="text-xs text-muted uppercase tracking-wider">
            {stats.unlocked}/{stats.total} Unlocked ({stats.percentage}%)
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-elevated rounded-full text-muted hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* Filter Bar */}
      <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar border-b border-border/30">
        {(["all", "bronze", "silver", "gold", "legendary"] as const).map(
          (t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                filter === t
                  ? "bg-white text-black border-white"
                  : "bg-surface text-muted border-border hover:border-muted"
              )}
            >
              {t}
            </button>
          )
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 md:grid-cols-4 gap-6 content-start pb-24">
        {filteredAchievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            layoutId={achievement.id}
            onClick={() => setSelectedAchievement(achievement)}
            className="flex flex-col items-center gap-2 cursor-pointer group"
          >
            <Badge
              tier={achievement.tier}
              icon={achievement.icon}
              isUnlocked={unlockedIds.has(achievement.id)}
              size="md"
              className="group-hover:scale-105 transition-transform"
            />
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wide text-center max-w-[80px]",
                unlockedIds.has(achievement.id) ? "text-text" : "text-muted/40"
              )}
            >
              {achievement.title}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAchievement(null)}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              layoutId={selectedAchievement.id}
              className="bg-surface border border-border rounded-xl p-8 max-w-sm w-full relative flex flex-col items-center text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Badge
                tier={selectedAchievement.tier}
                icon={selectedAchievement.icon}
                isUnlocked={unlockedIds.has(selectedAchievement.id)}
                size="lg"
                className="mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              />

              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedAchievement.title}
              </h2>
              <div
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border",
                  selectedAchievement.tier === "bronze"
                    ? "bg-amber-900/20 text-amber-500 border-amber-900/50"
                    : selectedAchievement.tier === "silver"
                    ? "bg-slate-800/50 text-slate-300 border-slate-700"
                    : selectedAchievement.tier === "gold"
                    ? "bg-yellow-900/20 text-yellow-500 border-yellow-900/50"
                    : "bg-emerald-900/20 text-emerald-400 border-emerald-900/50"
                )}
              >
                {selectedAchievement.tier} Tier
              </div>

              <p className="text-sm text-muted leading-relaxed mb-4">
                {selectedAchievement.description}
              </p>

              <div className="w-full bg-elevated rounded-lg p-3 border border-border/50">
                <p className="text-xs text-muted/60 uppercase tracking-widest mb-1">
                  Requirement
                </p>
                <p className="text-sm font-medium text-text">
                  {selectedAchievement.condition}
                </p>
              </div>

              {!unlockedIds.has(selectedAchievement.id) && (
                <div className="absolute top-4 right-4 text-muted/30">
                  <Lock className="w-6 h-6" />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
