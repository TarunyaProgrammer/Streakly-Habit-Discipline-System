import { HabitCell } from "./HabitCell";
import { cn } from "../utils/cn";

interface Habit {
  id: string;
  title: string;
  // We need full habit data for editing if we just pass ID.
  // Or parent finds it. Let's just pass ID back up.
}

interface HabitGridProps {
  days: string[];
  habits: Habit[];
  records: Map<string, Set<string>>;
  today: string;
  onToggle: (habitId: string, date: string) => void;
  onEdit: (habit: Habit) => void;
}

export const HabitGrid = ({
  days,
  habits,
  records,
  today,
  onToggle,
  onEdit,
}: HabitGridProps) => {
  return (
    <div className="w-full overflow-x-auto pb-20">
      {/* Grid Container */}
      <div
        className="grid gap-1 min-w-max px-4"
        style={{
          // CSS Grid template: First col is active habits (sticky), rest are days
          gridTemplateColumns: `120px repeat(${days.length}, 40px)`,
        }}
      >
        {/* Header Row: Dates */}
        <div className="sticky left-0 z-20 bg-background/95 backdrop-blur font-bold text-muted text-sm flex items-center p-2">
          Habit
        </div>
        {days.map((day) => {
          const isToday = day === today;
          return (
            <div
              key={day}
              className={cn(
                "flex flex-col items-center justify-center p-1 text-xs text-muted font-mono transition-colors",
                isToday && "text-today font-bold"
              )}
            >
              <span>{day.split("-")[2]}</span>
            </div>
          );
        })}

        {/* Rows: Habits */}
        {habits.map((habit) => (
          <div key={habit.id} className="contents group">
            {/* Habit Name (Sticky Left) */}
            <div className="sticky left-0 z-10 bg-background/95 backdrop-blur border-r border-border/50 flex items-center p-2 truncate">
              <button
                onClick={() => onEdit(habit)}
                className="text-sm font-medium text-text group-hover:text-white transition-colors hover:underline text-left"
              >
                {habit.title}
              </button>
            </div>

            {/* Cells */}
            {days.map((day) => {
              const isFuture = day > today;
              const isToday = day === today;
              const completed = records.get(day)?.has(habit.id);
              const status = completed ? "completed" : "empty";
              // Note: "Missed" logic can be applied if day < today and mandatory.
              // For UI simplicity in grid, we often just show checked or empty.
              // But prompt implies "Missed" color #EF4444.
              // Let's add simple "Missed" if day < today and not completed (assuming strict mode).
              // This is purely visual.
              const finalStatus =
                !isFuture && !completed && day < today ? "missed" : status;
              // Actually, "Missed" usually only if mandatory.
              // Let's stick to "empty" for now to avoid red sea, unless requested.
              // Prompt says "Missed #EF4444". Let's apply it for past days.

              return (
                <div
                  key={`${habit.id}-${day}`}
                  className="flex items-center justify-center"
                >
                  <HabitCell
                    date={day}
                    isToday={isToday}
                    isFuture={isFuture}
                    status={finalStatus}
                    onClick={() => onToggle(habit.id, day)}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
