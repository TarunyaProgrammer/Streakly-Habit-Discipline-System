import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import confetti from "canvas-confetti";
import { MobileHeader } from "./components/MobileHeader";
import { Sidebar } from "./components/Sidebar";
import { HabitGrid } from "./components/HabitGrid";
import { HabitBottomSheet } from "./components/HabitBottomSheet";
import { useHabitData, type HabitData } from "./hooks/useHabitData";
import { getToday, getDaysInMonth } from "./utils/dates";
import { calculateCurrentStreak } from "./utils/streak";

function App() {
  const {
    habits,
    records,
    loading,
    createHabit,
    updateHabit,
    removeHabit,
    toggle,
  } = useHabitData();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitData | null>(null);

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
      // Update
      // We need creation date from existing habit
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
      // Create
      await createHabit({
        title: data.title,
        type: data.type,
        weekendOff: data.weekendOff,
      });
    }
    setIsSheetOpen(false);
    setEditingHabit(null);
  };

  // ... (rest of component)
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
    // Transform records Map to Record[] for the utility
    const recordsList: { habitId: string; date: string; completed: boolean }[] =
      [];
    records.forEach((habitIds, date) => {
      habitIds.forEach((habitId) => {
        recordsList.push({ habitId, date, completed: true });
      });
    });
    return calculateCurrentStreak(habits, recordsList, today);
  }, [habits, records, today]);

  // Effects for Animations
  useEffect(() => {
    // Confetti: First habit
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
    // Shake: Streak break
    // If current streak is LESS than previous streak, and previous streak was > 0
    // Note: First load prevStreakRef is 0.
    if (streak < prevStreakRef.current && prevStreakRef.current > 0) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
    prevStreakRef.current = streak;
  }, [streak]);

  const dailyProgress = useMemo(() => {
    if (habits.length === 0) return 0;

    // Filter active habits for today
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

  return (
  return (
    <div className="min-h-screen bg-background text-text font-sans selection:bg-today selection:text-white flex flex-col md:flex-row">
      <div className="md:hidden">
        <MobileHeader
          streak={streak}
          dailyProgress={dailyProgress}
          shake={isShaking}
        />
      </div>

      <Sidebar 
        streak={streak}
        dailyProgress={dailyProgress}
        viewMonthLabel={viewMonthLabel}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onAddHabit={() => handleOpenSheet()}
      />

      <main className="flex-1 pt-20 pb-24 md:py-8 md:px-8 min-h-screen md:min-h-0 md:h-screen md:overflow-y-auto">
        {/* Month Navigation - Mobile Only */}
        <div className="flex md:hidden items-center justify-between px-4 mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-muted hover:text-white transition-colors"
          >
            {/* Chevron Left */}
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
            {/* Chevron Right */}
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
                // Find full habit object
                const fullHabit = habits.find((h) => h.id === habit.id);
                if (fullHabit) handleOpenSheet(fullHabit);
              }}
            />
          </div>
        )}
      </main>

      {/* FAB - Mobile Only */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleOpenSheet()}
        className="fixed bottom-6 right-6 w-14 h-14 bg-today text-white rounded-full shadow-lg shadow-blue-500/20 flex md:hidden items-center justify-center z-40 transition-shadow hover:shadow-blue-500/40"
      >
        <Plus className="w-7 h-7" strokeWidth={3} />
      </motion.button>

      <HabitBottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSave={handleSaveHabit}
        onDelete={removeHabit}
        initialData={editingHabit}
      />
    </div>
  );
}

export default App;
