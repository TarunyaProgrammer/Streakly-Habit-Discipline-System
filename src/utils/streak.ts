import { isWeekend } from "./dates";

interface Habit {
  id: string;
  type: "mandatory" | "optional";
  weekendOff: boolean;
  createdAt: string; // YYYY-MM-DD or ISO
}

interface Record {
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

/**
 * Calculates the current streak based on strict rules.
 * - Mandatory missed = reset
 * - Only optional = streak 0
 * - Mid-month add = ignored for past
 */
export const calculateCurrentStreak = (
  habits: Habit[],
  records: Record[],
  today: string
): number => {
  const mandatoryHabits = habits.filter((h) => h.type === "mandatory");

  if (mandatoryHabits.length === 0) {
    return 0;
  }

  // Create a fast lookup for records
  // Map<date, Set<habitId>>
  const completionMap = new Map<string, Set<string>>();
  records.forEach((r) => {
    if (r.completed) {
      if (!completionMap.has(r.date)) {
        completionMap.set(r.date, new Set());
      }
      completionMap.get(r.date)!.add(r.habitId);
    }
  });

  let streak = 0;
  let d = new Date(today);

  // Safety break to prevent infinite loops
  const maxLookback = 365 * 2;

  for (let i = 0; i < maxLookback; i++) {
    const dateStr = d.toISOString().split("T")[0];

    // Determine active mandatory habits for this day
    const activeMandatory = mandatoryHabits.filter((h) => {
      // 1. Must be created on or before this date
      const createdDate = h.createdAt.split("T")[0];
      if (createdDate > dateStr) return false;

      // 2. Weekend check
      if (h.weekendOff && isWeekend(dateStr)) return false;

      return true;
    });

    if (activeMandatory.length === 0) {
      // No mandatory habits active on this day.
      // If we are looking at today, and no habits are applicable, it shouldn't break the streak?
      // Or if simply NO mandatory habits existed back then, we continue?
      // "Habit added mid-month -> Does NOT affect previous days"
      // If we go back before any mandatory habit existed, the streak ends naturally? Or continues?
      // Usually streak is "consecutive days of discipline". If no discipline was required, it counts?
      // Prompt says "No habits exist -> Streak = 0".
      // Let's assume if no mandatory habits required, we stop counting.
      if (streak > 0) {
        // If we have a streak going, and we hit a day with NO requirements, does it continue?
        // E.g. Vacation mode? Prompt doesn't specify.
        // Logic: "Only optional habits exist -> Streak not counted".
        // So if day has 0 mandatory, it breaks the chain of "discipline".
        // UNLESS it's due to weekend off?
        // If weekend off, activeMandatory is empty.
        // If activeMandatory empty BUT it's weekend and habits exist...
        // Let's check if habits exist at all.
        const habitsExist = mandatoryHabits.some(
          (h) => h.createdAt.split("T")[0] <= dateStr
        );
        if (!habitsExist) {
          break; // Stop if before inception
        }

        // If habits exist but are exempt (weekend), we SKIP this day (don't increment, don't break)
        // But wait, if Friday was done (streak=1), Sat/Sun are off, Monday is done (streak=2).
        // So we shouldn't break, but shouldn't increment?
        // "Streak calculated via local date only".
        // Typically weekend skip means the streak is preserved.
        // So we simply decrement date and continue loop WITHOUT incrementing streak.
        d.setDate(d.getDate() - 1);
        continue;
      } else {
        // Streak hasn't started (e.g. looking at today/yesterday and no habits).
        if (dateStr === today) {
          d.setDate(d.getDate() - 1);
          continue;
        }
        break;
      }
    }

    // Check if ALL active mandatory habits are completed
    const dayCompleted = activeMandatory.every((h) =>
      completionMap.get(dateStr)?.has(h.id)
    );

    if (dayCompleted) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      // Logic: "Miss yesterday, complete today -> New streak starts at 1"
      // If we are checking TODAY and it's not done, we don't reset to 0 yet, we just don't count it.
      // But if we check YESTERDAY and it's not done, streak breaks.
      if (dateStr === today) {
        // Today not done. Check yesterday.
        d.setDate(d.getDate() - 1);
        continue;
      } else {
        // A past day was missed. Streak ends.
        break;
      }
    }
  }

  return streak;
};
