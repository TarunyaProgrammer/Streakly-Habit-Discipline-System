import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface Habit {
  id: string;
  title: string;
  type: "mandatory" | "optional";
  weekendOff: boolean;
  createdAt: string; // ISO Date
}

export interface Record {
  id: string; // composite key: habitId:YYYY-MM-DD
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface Meta {
  key: string;
  value: any;
}

interface StreaklyDB extends DBSchema {
  habits: {
    key: string;
    value: Habit;
  };
  records: {
    key: string;
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

export async function initDB() {
  return openDB<StreaklyDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Habits store
      if (!db.objectStoreNames.contains("habits")) {
        db.createObjectStore("habits", { keyPath: "id" });
      }

      // Records store
      if (!db.objectStoreNames.contains("records")) {
        const recordStore = db.createObjectStore("records", { keyPath: "id" });
        recordStore.createIndex("by-habit", "habitId");
        recordStore.createIndex("by-date", "date");
      }

      // Meta store
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" });
      }
    },
  });
}

export const dbOperations = {
  async getHabits(db: IDBPDatabase<StreaklyDB>) {
    return db.getAll("habits");
  },

  async addHabit(db: IDBPDatabase<StreaklyDB>, habit: Habit) {
    return db.put("habits", habit);
  },

  async deleteHabit(db: IDBPDatabase<StreaklyDB>, id: string) {
    return db.delete("habits", id);
  },

  async getRecords(db: IDBPDatabase<StreaklyDB>, habitId: string) {
    return db.getAllFromIndex("records", "by-habit", habitId);
  },

  async getRecordsByDate(db: IDBPDatabase<StreaklyDB>, date: string) {
    return db.getAllFromIndex("records", "by-date", date);
  },

  async toggleRecord(db: IDBPDatabase<StreaklyDB>, record: Record) {
    return db.put("records", record);
  },

  async getMeta(db: IDBPDatabase<StreaklyDB>, key: string) {
    return db.get("meta", key);
  },

  async setMeta(db: IDBPDatabase<StreaklyDB>, key: string, value: any) {
    return db.put("meta", { key, value });
  },
};
