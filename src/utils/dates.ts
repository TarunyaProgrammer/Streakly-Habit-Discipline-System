import { format, isSaturday, isSunday, parseISO, startOfDay } from "date-fns";

/**
 * Returns the current date in YYYY-MM-DD format based on local time.
 */
export const getToday = (): string => {
  return format(startOfDay(new Date()), "yyyy-MM-dd");
};

/**
 * Formats a YYYY-MM-DD string into a readable format (e.g., "Mon, 12").
 */
export const formatDisplayDate = (dateStr: string): string => {
  return format(parseISO(dateStr), "EEE, d");
};

/**
 * Checks if a given date string (YYYY-MM-DD) is a weekend.
 */
export const isWeekend = (dateStr: string): boolean => {
  const date = parseISO(dateStr);
  return isSaturday(date) || isSunday(date);
};

/**
 * Returns an array of dates for the current month.
 */
export const getDaysInMonth = (date: Date = new Date()): string[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: string[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(format(new Date(year, month, i), "yyyy-MM-dd"));
  }
  return days;
};
