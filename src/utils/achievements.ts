```typescript
import { differenceInDays, parseISO, subDays } from "date-fns";
import { Habit } from "../store/db";

export type Tier = "bronze" | "silver" | "gold" | "legendary";

export interface AchievementDef {
  id: string;
  title: string;
  tier: Tier;
  icon: string; // Lucide icon name
  description: string;
  condition: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // 🔥 Streak-Based
  {
    id: "streak_7",
    title: "First Flame",
    tier: "bronze",
    icon: "Flame",
    description: "Maintain a 7-day mandatory streak",
    condition: "7-day mandatory streak",
  },
  {
    id: "streak_21",
    title: "Habit Solidified",
    tier: "silver",
    icon: "Zap",
    description: "Maintain a 21-day mandatory streak",
    condition: "21-day mandatory streak",
  },
  {
    id: "streak_30",
    title: "Unbreakable Month",
    tier: "gold",
    icon: "Shield",
    description: "Maintain a 30-day mandatory streak",
    condition: "30-day mandatory streak",
  },
  {
    id: "streak_60",
    title: "Two-Month Titan",
    tier: "gold",
    icon: "Swords",
    description: "Maintain a 60-day mandatory streak",
    condition: "60-day mandatory streak",
  },
  {
    id: "streak_100",
    title: "Centurion",
    tier: "legendary",
    icon: "Crown",
    description: "Maintain a 100-day mandatory streak",
    condition: "100-day mandatory streak",
  },

  // 📆 Consistency
  {
    id: "perfect_week",
    title: "Perfect Week",
    tier: "bronze",
    icon: "CalendarCheck",
    description: "Complete all mandatory habits Mon-Sun",
    condition: "Perfect Mon-Sun",
  },
  {
    id: "perfect_month",
    title: "Perfect Month",
    tier: "gold",
    icon: "CalendarRange",
    description: "No mandatory misses in a calendar month",
    condition: "Perfect Calendar Month",
  },
  {
    id: "no_zero_14",
    title: "Zero-Day Killer",
    tier: "silver",
    icon: "Target",
    description: "At least one completion every day for 14 days",
    condition: "No zero days for 14 days",
  },
  {
    id: "comeback_3",
    title: "Comeback Kid",
    tier: "bronze",
    icon: "RefreshCw",
    description: "Restart a streak within 3 days of breaking it",
    condition: "Restart streak < 3 days",
  },

  // ⏳ Time-of-Day
  {
    id: "dawn_warrior",
    title: "Dawn Warrior",
    tier: "silver",
    icon: "Sunrise",
    description: "Complete 10 habits before 6:30 AM",
    condition: "10x before 6:30am",
  },
  {
    id: "midnight_grind",
    title: "Midnight Grind",
    tier: "silver",
    icon: "Moon",
    description: "Complete 10 habits after 11 PM",
    condition: "10x after 11pm",
  },

  // 🧱 Resilience
  {
    id: "bad_day_defier",
    title: "Bad Day Defier",
    tier: "bronze",
    icon: "Umbrella",
    description: "Perfect completion day immediately after a missed day",
    condition: "Perfect day after miss",
  },
  {
    id: "iron_weekend",
    title: "Iron Weekend",
    tier: "gold",
    icon: "Dumbbell",
    description: "Perfect Saturday & Sunday for 4 weekends",
    condition: "4x Perfect Sat+Sun",
  },
  {
    id: "relapse_destroyer",
    title: "Relapse Destroyer",
    tier: "silver",
    icon: "Skull",
    description: "Restart a streak within 24 hours of breaking",
    condition: "Restart streak < 24h",
  },

  // 🧠 Growth
  {
    id: "habit_architect",
    title: "Habit Architect",
    tier: "bronze",
    icon: "PenTool",
    description: "Create 5 habits",
    condition: "5 habits created",
  },
  {
    id: "refinement_master",
    title: "Optimization Loop",
    tier: "silver",
    icon: "Settings",
    description: "Edit habits 10 times",
    condition: "10 habit edits",
  },
  {
    id: "data_driven",
    title: "Data Driven",
    tier: "bronze",
    icon: "BarChart",
    description: "Check stats page 10 times",
    condition: "View stats 10 times",
  }, // Modified to View Stats for feasibility

  // 🌊 Loyalty
  {
    id: "never_fade",
    title: "Never Fade",
    tier: "legendary",
    icon: "Infinity",
    description: "Open app 60 days in a row",
    condition: "60-day open streak",
  },
  {
    id: "habit_legacy",
    title: "Habit Legacy",
    tier: "gold",
    icon: "BookOpen",
    description: "Use app for 6 months",
    condition: "Account age > 6 months",
  },
  {
    id: "immortal",
    title: "Immortal",
    tier: "legendary",
    icon: "Ghost",
    description: "Use app for 1 year",
    condition: "Account age > 1 year",
  },
];

// Helper to check time constraints
const checkTime = (
  timestamp: string,
  condition: "before_6_30" | "after_11_00"
) => {
  const date = parseISO(timestamp);
  const hour = date.getHours();
  const minute = date.getMinutes();

  if (condition === "before_6_30") {
    return hour < 6 || (hour === 6 && minute <= 30);
  }
  if (condition === "after_11_00") {
    return hour >= 23;
  }
  return false;
};

// Pure function to evaluate achievements
export const evaluateAchievements = (
  habits: Habit[],
  records: {
    habitId: string;
    date: string;
    completed: boolean;
    timestamp?: string;
  }[],
  currentStreak: number,
  unlockedIds: Set<string>
): string[] => {
  const newUnlocks: string[] = [];

  // 1. Streak Based
  if (!unlockedIds.has("streak_7") && currentStreak >= 7)
    newUnlocks.push("streak_7");
  if (!unlockedIds.has("streak_21") && currentStreak >= 21)
    newUnlocks.push("streak_21");
  if (!unlockedIds.has("streak_30") && currentStreak >= 30)
    newUnlocks.push("streak_30");
  if (!unlockedIds.has("streak_60") && currentStreak >= 60)
    newUnlocks.push("streak_60");
  if (!unlockedIds.has("streak_100") && currentStreak >= 100)
    newUnlocks.push("streak_100");

  // 2. Growth
  if (!unlockedIds.has("habit_architect") && habits.length >= 5)
    newUnlocks.push("habit_architect");

  // 3. Time of Day (Simulated Check based on accumulation)
  // We need to count matching records strictly if we want to be accurate.
  // For MVP, if we spot *enough* distinct days with this behavior, we unlock.
  const dawnCount = records.filter(
    (r) => r.timestamp && checkTime(r.timestamp, "before_6_30")
  ).length;
  if (!unlockedIds.has("dawn_warrior") && dawnCount >= 10)
    newUnlocks.push("dawn_warrior");

  const nightCount = records.filter(
    (r) => r.timestamp && checkTime(r.timestamp, "after_11_00")
  ).length;
  if (!unlockedIds.has("midnight_grind") && nightCount >= 10)
    newUnlocks.push("midnight_grind");

  // 4. Zero Day Killer (14 days no zeros)
  // Sort records by date
  // This is computationally heavy, might need optimization in production
  // Simplified check: Check last 14 days
  if (!unlockedIds.has("no_zero_14")) {
    const today = new Date();
    let zeroFreeStreak = 0;
    for (let i = 0; i < 14; i++) {
      const d = subDays(today, i).toISOString().split("T")[0];
      const hasCompletion = records.some((r) => r.date === d && r.completed);
      if (hasCompletion) zeroFreeStreak++;
      else break;
    }
    if (zeroFreeStreak >= 14) newUnlocks.push("no_zero_14");
  }

  // Legacy / Loyalty (Requires first record date or meta)
  // Fallback to first habit creation date
  if (habits.length > 0) {
    const oldestHabit = habits.reduce((oldest, h) =>
      h.createdAt < oldest.createdAt ? h : oldest
    );
    const daysSinceStart = differenceInDays(
      new Date(),
      parseISO(oldestHabit.createdAt)
    );

    if (!unlockedIds.has("habit_legacy") && daysSinceStart >= 180)
      newUnlocks.push("habit_legacy");
    if (!unlockedIds.has("immortal") && daysSinceStart >= 365)
      newUnlocks.push("immortal");
  }

  return newUnlocks;
};
