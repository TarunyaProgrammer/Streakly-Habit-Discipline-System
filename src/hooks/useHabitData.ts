import { useState, useEffect, useCallback } from "react";
import {
  getHabits,
  getRecordsByHabit,
  addHabit,
  deleteHabit,
  toggleRecord,
} from "../store/db";

export interface HabitData {
  id: string;
  title: string;
  type: "mandatory" | "optional";
  weekendOff: boolean;
  createdAt: string;
}

export const useHabitData = () => {
  const [habits, setHabits] = useState<HabitData[]>([]);
  const [records, setRecords] = useState<Map<string, Set<string>>>(new Map());
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const allHabits = await getHabits();
      setHabits(allHabits);

      // Load records
      const recordsMap = new Map<string, Set<string>>();

      // To optimize, we could load only current month, but for now load all (MVP)
      // Or better: iterate habits and load records?
      // "getRecordsByHabit"

      // Actually, we need records to calculate streaks and render grid.
      // Let's load ALL records for now (IndexedDB is fast enough for list of simple objects).
      // We don't have a "getAllRecords" in db.ts repo yet.
      // Let's add it or iterate habits.
      // Iterating habits logic:

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
    // We don't have updateHabit in db.ts yet?
    // db.ts has `put` so addHabit works for update if key exists.
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

    await toggleRecord(habitId, date, newCompleted);
    // We can reload or trust optimistic. Let's just trust optimistic for now to be fast.
  };

  return {
    habits,
    records,
    loading,
    createHabit,
    updateHabit,
    removeHabit,
    toggle,
  };
};
