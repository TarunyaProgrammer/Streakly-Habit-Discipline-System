import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  type Habit,
  type Record as HabitRecord,
  initDB,
  dbOperations,
} from "../utils/db";
import { type IDBPDatabase } from "idb";

interface HabitContextType {
  habits: Habit[];
  records: Record<string, HabitRecord[]>; // habitId -> records
  isLoading: boolean;
  addHabit: (
    title: string,
    type: "mandatory" | "optional",
    weekendOff: boolean
  ) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabit: (habitId: string, date: string) => Promise<void>;
  getRecordsForHabit: (habitId: string) => HabitRecord[];
  getRecord: (habitId: string, date: string) => boolean;
}

const HabitContext = createContext<HabitContextType | null>(null);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [db, setDb] = useState<IDBPDatabase<any> | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [records, setRecords] = useState<Record<string, HabitRecord[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setup = async () => {
      const database = await initDB();
      setDb(database);
      const output = await dbOperations.getHabits(database);
      setHabits(output);

      // Load all records
      const allRecords: Record<string, HabitRecord[]> = {};
      for (const h of output) {
        const recs = await dbOperations.getRecords(database, h.id);
        allRecords[h.id] = recs;
      }
      setRecords(allRecords);
      setIsLoading(false);
    };
    setup();
  }, []);

  const addHabit = useCallback(
    async (
      title: string,
      type: "mandatory" | "optional",
      weekendOff: boolean
    ) => {
      if (!db) return;
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        title,
        type,
        weekendOff,
        createdAt: new Date().toISOString(),
      };
      await dbOperations.addHabit(db, newHabit);
      setHabits((prev) => [...prev, newHabit]);
      setRecords((prev) => ({ ...prev, [newHabit.id]: [] }));
    },
    [db]
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      if (!db) return;
      await dbOperations.deleteHabit(db, id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
      // Optional: cleanup records
    },
    [db]
  );

  const toggleRecord = useCallback(
    async (habitId: string, date: string) => {
      if (!db) return;
      const currentRecords = records[habitId] || [];
      const existingIndex = currentRecords.findIndex((r) => r.date === date);
      const existing = currentRecords[existingIndex];

      const completed = !existing?.completed;

      // If setting to false, maybe remove from DB? Or just set completed=false.
      // Requirement says "Tap cell toggles completion". Checkbox style.
      // Storing "completed: false" is fine.

      const record: HabitRecord = {
        id: `${habitId}:${date}`,
        habitId,
        date,
        completed,
      };

      await dbOperations.toggleRecord(db, record);

      setRecords((prev) => {
        const newHabitRecords = [...(prev[habitId] || [])];

        if (existingIndex >= 0) {
          newHabitRecords[existingIndex] = record;
        } else {
          newHabitRecords.push(record);
        }

        return {
          ...prev,
          [habitId]: newHabitRecords,
        };
      });
    },
    [db, records]
  );

  const getRecordsForHabit = useCallback(
    (habitId: string) => {
      return records[habitId] || [];
    },
    [records]
  );

  const getRecord = useCallback(
    (habitId: string, date: string) => {
      const list = records[habitId] || [];
      const found = list.find((r) => r.date === date);
      return found ? found.completed : false;
    },
    [records]
  );

  return (
    <HabitContext.Provider
      value={{
        habits,
        records,
        isLoading,
        addHabit,
        deleteHabit,
        toggleHabit: toggleRecord,
        getRecordsForHabit,
        getRecord,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabitStore = () => {
  const context = useContext(HabitContext);
  if (!context)
    throw new Error("useHabitStore must be used within HabitProvider");
  return context;
};
