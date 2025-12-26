import { openDB, type DBSchema, type IDBPDatabase } from "idb";

interface Habit {
  id: string;
  title: string;
  type: "mandatory" | "optional";
  weekendOff: boolean;
  createdAt: string; // ISODate
}

interface Record {
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

interface Meta {
  key: string;
  value: any;
}

interface StreaklyDB extends DBSchema {
  habits: {
    key: string;
    value: Habit;
  };
  records: {
    key: [string, string]; // [habitId, date]
    value: Record;
    indexes: { "by-habit": string; "by-date": string };
  };
  meta: {
    key: string;
    value: Meta;
  };
}

const DB_NAME = "streakly-db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<StreaklyDB>>;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<StreaklyDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("habits")) {
          db.createObjectStore("habits", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("records")) {
          const recordStore = db.createObjectStore("records", {
            keyPath: ["habitId", "date"],
          });
          recordStore.createIndex("by-habit", "habitId");
          recordStore.createIndex("by-date", "date");
        }
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta", { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
};

// Repository Functions

// Habits
export const addHabit = async (habit: Habit) => {
  const db = await getDB();
  return db.put("habits", habit);
};

export const getHabits = async () => {
  const db = await getDB();
  return db.getAll("habits");
};

export const deleteHabit = async (id: string) => {
  const db = await getDB();
  return db.delete("habits", id);
};

// Records
export const toggleRecord = async (
  habitId: string,
  date: string,
  completed: boolean
) => {
  const db = await getDB();
  return db.put("records", { habitId, date, completed });
};

export const getRecordsByHabit = async (habitId: string) => {
  const db = await getDB();
  return db.getAllFromIndex("records", "by-habit", habitId);
};

export const getRecordsByDate = async (date: string) => {
  const db = await getDB();
  return db.getAllFromIndex("records", "by-date", date);
};

// Meta
export const getMeta = async (key: string) => {
  const db = await getDB();
  return db.get("meta", key);
};

export const setMeta = async (key: string, value: any) => {
  const db = await getDB();
  return db.put("meta", { key, value });
};
