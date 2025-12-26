import { useState, useEffect, useCallback } from "react";
import {
  getHabits,
  getRecordsByHabit,
  addHabit,
  deleteHabit,
  toggleRecord,
  getAchievements,
} from "../store/db";

export interface HabitData {
  id: string;
  title: string;
  type: "mandatory" | "optional";
  weekendOff: boolean;
  createdAt: string;
}

export interface AchievementData {
  id: string;
  unlockedAt: string;
}

export const useHabitData = () => {
  const [habits, setHabits] = useState<HabitData[]>([]);
  const [records, setRecords] = useState<Map<string, Set<string>>>(new Map());
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [allHabits, allAchievements] = await Promise.all([
        getHabits(),
        getAchievements(),
      ]);
      setHabits(allHabits);
      setAchievements(allAchievements);

      // Load records
      const recordsMap = new Map<string, Set<string>>();

      const promises = allHabits.map((h) => getRecordsByHabit(h.id));
      const results = await Promise.all(promises);

      results.forEach((habitRecords) => {
        habitRecords.forEach((r) => {
          if (r.completed) {
            if (!recordsMap.has(r.date)) {
              recordsMap.set(r.date, new Set());
            }
            recordsMap.get(r.date)!.add(r.habitId);
          }
        });
      });

      setRecords(recordsMap);
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createHabit = async (habit: Omit<HabitData, "id" | "createdAt">) => {
    const newHabit: HabitData = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await addHabit(newHabit);
    await loadData(); // Reload to refresh
  };

  const updateHabit = async (habit: HabitData) => {
    await addHabit(habit);
    await loadData();
  };

  const removeHabit = async (id: string) => {
    await deleteHabit(id);
    await loadData();
  };

  const toggle = async (habitId: string, date: string) => {
    // Optimistic update
    const isCompleted = records.get(date)?.has(habitId) ?? false;
    const newCompleted = !isCompleted;

    setRecords((prev) => {
      const next = new Map(prev);
      if (!next.has(date)) next.set(date, new Set());
      if (newCompleted) {
        next.get(date)!.add(habitId);
      } else {
        next.get(date)!.delete(habitId);
      }
      return next;
    });

    // Add timestamp for time-of-day tracking
    const timestamp = new Date().toISOString();
    await toggleRecord(habitId, date, newCompleted, timestamp);
    // We intentionally don't reload here unless we want to check for achievements immediately
    // Ideally, we check achievements here!
    // But let's verify data flow first. User logic step is next.
  };

  return {
    habits,
    records,
    achievements,
    loading,
    createHabit,
    updateHabit,
    removeHabit,
    toggle,
    reload: loadData, // Expose for manual refresh if needed
  };
};
