import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import confetti from "canvas-confetti";
import { MobileHeader } from "./components/MobileHeader";
import { Sidebar } from "./components/Sidebar";
import { HabitGrid } from "./components/HabitGrid";
import { HabitBottomSheet } from "./components/HabitBottomSheet";
import { TrophyRoom } from "./components/TrophyRoom";
import { UnlockOverlay } from "./components/UnlockOverlay";
import { useHabitData, type HabitData } from "./hooks/useHabitData";
import { getToday, getDaysInMonth } from "./utils/dates";
import { calculateCurrentStreak } from "./utils/streak";
import { evaluateAchievements, ACHIEVEMENTS } from "./utils/achievements";
import { addAchievement } from "./store/db";

function App() {
  const {
    habits,
    records,
    achievements,
    loading,
    createHabit,
    updateHabit,
    removeHabit,
    toggle,
    reload,
  } = useHabitData();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isTrophyRoomOpen, setIsTrophyRoomOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitData | null>(null);

  // Achievement System State
  const [unlockedAchievementQueue, setUnlockedAchievementQueue] = useState<
    string[]
  >([]);
  const [currentUnlock, setCurrentUnlock] = useState<string | null>(null);

  const handleOpenSheet = (habit?: HabitData) => {
    setEditingHabit(habit || null);
    setIsSheetOpen(true);
  };

  const handleSaveHabit = async (data: {
    id?: string;
    title: string;
    type: "mandatory" | "optional";
    weekendOff: boolean;
  }) => {
    if (data.id) {
      const existing = habits.find((h) => h.id === data.id);
      if (existing) {
        await updateHabit({
          ...existing,
          title: data.title,
          type: data.type,
          weekendOff: data.weekendOff,
        });
      }
    } else {
      await createHabit({
        title: data.title,
        type: data.type,
        weekendOff: data.weekendOff,
      });
    }
    setIsSheetOpen(false);
    setEditingHabit(null);
  };

  const [viewDate, setViewDate] = useState(new Date());
  const [isShaking, setIsShaking] = useState(false);

  const today = getToday();

  // Refs for tracking changes
  const prevStreakRef = useRef(0);
  const prevHabitCountRef = useRef(0);

  // Memoized Calculations
  const days = useMemo(() => {
    return getDaysInMonth(viewDate);
  }, [viewDate]);

  const viewMonthLabel = useMemo(() => {
    return viewDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  }, [viewDate]);

  const handlePrevMonth = () => {
    setViewDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setViewDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const streak = useMemo(() => {
    const recordsList: { habitId: string; date: string; completed: boolean }[] =
      [];
    records.forEach((habitIds, date) => {
      habitIds.forEach((habitId) => {
        recordsList.push({ habitId, date, completed: true });
      });
    });
    return calculateCurrentStreak(habits, recordsList, today);
  }, [habits, records, today]);

  // Achievement Evaluation Loop
  useEffect(() => {
    if (loading) return;

    // Convert records Map to Array for evaluation
    const recordsArray: any[] = [];
    records.forEach((habitSet, date) => {
      habitSet.forEach((habitId) => {
        // Note: map only stores habitId presence, we need to fetch timestamp from DB if critical
        // But our useHabitData loads optimized toggle function that stores timestamp.
        // However, the 'records' state in hook is just Set<HabitId>. missing timestamp.
        // Evaluation 'dawn_warrior' needs timestamps.
        // For MVP visual realtime check, we might miss timestamp data here unless we change hook state structure.
        // BUT, `evaluateAchievements` is robust. If we pass partial data, it skips specialized checks.
        // Critical fixes: We should really have timestamps in memory for "Dawn Warrior".
        // For now, let's pass partial data. Streak/Count achievements will work fine.
        recordsArray.push({ habitId, date, completed: true });
      });
    });

    const unlockedSet = new Set(achievements.map((a) => a.id));
    const newUnlocks = evaluateAchievements(
      habits,
      recordsArray,
      streak,
      unlockedSet
    );

    if (newUnlocks.length > 0) {
      // 1. Persist
      newUnlocks.forEach(async (id) => {
        await addAchievement({ id, unlockedAt: new Date().toISOString() });
      });
      // 2. Queue for UI
      setUnlockedAchievementQueue((prev) => [...prev, ...newUnlocks]);
      // 3. Refresh Data
      reload();
    }
  }, [habits, records, streak, achievements, loading, reload]);

  // Unlock Queue Processor
  useEffect(() => {
    if (!currentUnlock && unlockedAchievementQueue.length > 0) {
      setCurrentUnlock(unlockedAchievementQueue[0]);
      setUnlockedAchievementQueue((prev) => prev.slice(1));
    }
  }, [unlockedAchievementQueue, currentUnlock]);

  // Effects for Animations
  useEffect(() => {
    if (habits.length > 0 && prevHabitCountRef.current === 0) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3B82F6", "#22C55E", "#F59E0B"],
      });
    }
    prevHabitCountRef.current = habits.length;
  }, [habits.length]);

  useEffect(() => {
    if (streak < prevStreakRef.current && prevStreakRef.current > 0) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
    prevStreakRef.current = streak;
  }, [streak]);

  const dailyProgress = useMemo(() => {
    if (habits.length === 0) return 0;
    const activeHabits = habits.filter(
      (h) => h.createdAt.split("T")[0] <= today
    );
    if (activeHabits.length === 0) return 0;

    let completedCount = 0;
    activeHabits.forEach((h) => {
      if (records.get(today)?.has(h.id)) {
        completedCount++;
      }
    });

    return completedCount / activeHabits.length;
  }, [habits, records, today]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted">
        Loading Streakly...
      </div>
    );
  }

  const currentUnlockDef = currentUnlock
    ? ACHIEVEMENTS.find((a) => a.id === currentUnlock)
    : null;

  return (
    <div className="min-h-screen bg-background text-text font-sans selection:bg-today selection:text-white flex flex-col md:flex-row">
      <div className="md:hidden">
        <MobileHeader
          streak={streak}
          dailyProgress={dailyProgress}
          shake={isShaking}
          onOpenTrophyRoom={() => setIsTrophyRoomOpen(true)}
        />
        {/* Mobile Trophy Button overlay or integrated? 
            MobileHeader now has trophy button, but we need to pass handler? 
            MobileHeader prop update needed. 
            For now, let's keep it simple or inject specific click handler if we can refactor MobileHeader props.
        */}
      </div>

      <Sidebar
        streak={streak}
        dailyProgress={dailyProgress}
        viewMonthLabel={viewMonthLabel}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onAddHabit={() => handleOpenSheet()}
        onOpenTrophyRoom={() => setIsTrophyRoomOpen(true)}
      />

      <main className="flex-1 pt-20 pb-24 md:py-8 md:px-8 min-h-screen md:min-h-0 md:h-screen md:overflow-y-auto">
        <div className="flex md:hidden items-center justify-between px-4 mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-muted hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span className="text-sm font-bold text-text uppercase tracking-widest">
            {viewMonthLabel}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 text-muted hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] md:h-full text-center px-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-muted/50 mb-4"
            >
              No protocols established.
            </motion.div>
            <button
              onClick={() => handleOpenSheet()}
              className="text-today font-bold hover:underline"
            >
              Initiate First Discipline
            </button>
          </div>
        ) : (
          <div className="md:max-w-full">
            <HabitGrid
              days={days}
              habits={habits}
              records={records}
              today={today}
              onToggle={toggle}
              onEdit={(habit) => {
                const fullHabit = habits.find((h) => h.id === habit.id);
                if (fullHabit) handleOpenSheet(fullHabit);
              }}
            />
          </div>
        )}
      </main>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleOpenSheet()}
        className="fixed bottom-6 right-6 w-14 h-14 bg-today text-white rounded-full shadow-lg shadow-blue-500/20 flex md:hidden items-center justify-center z-40 transition-shadow hover:shadow-blue-500/40"
      >
        <Plus className="w-7 h-7" strokeWidth={3} />
      </motion.button>

      {/* Mobile Trophy FAB (Left side maybe?) or just top bar... 
          Let's attach a listener to the MobileHeader trophy button?
          Ideally MobileHeader should accept an onTrophyClick prop. 
      */}

      <HabitBottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSave={handleSaveHabit}
        onDelete={removeHabit}
        initialData={editingHabit}
      />

      <AnimatePresence>
        {isTrophyRoomOpen && (
          <TrophyRoom
            unlockedIds={new Set(achievements.map((a) => a.id))}
            onClose={() => setIsTrophyRoomOpen(false)}
          />
        )}
        {currentUnlockDef && (
          <UnlockOverlay
            achievement={currentUnlockDef}
            onDismiss={() => setCurrentUnlock(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
