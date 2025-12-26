import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "../utils/cn";

interface StreakPulseProps {
  streak: number;
  shake?: boolean;
}

export const StreakPulse = ({ streak, shake }: StreakPulseProps) => {
  const isHighStreak = streak >= 7;

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        shake && "animate-shake text-missed"
      )}
    >
      <div className="relative">
        <motion.div
          animate={
            isHighStreak && !shake
              ? {
                  scale: [1, 1.2, 1],
                  filter: [
                    "drop-shadow(0 0 0px #3B82F6)",
                    "drop-shadow(0 0 8px #3B82F6)",
                    "drop-shadow(0 0 0px #3B82F6)",
                  ],
                }
              : {}
          }
          transition={
            isHighStreak
              ? {
                  duration: 1, // 1s neon pulse
                  repeat: Infinity,
                  repeatDelay: 5, // every 5s
                  ease: "easeInOut",
                }
              : {}
          }
        >
          <Flame
            className={cn(
              "w-5 h-5 transition-colors duration-300",
              streak > 0 ? "text-warning fill-warning" : "text-muted"
            )}
            strokeWidth={2.5}
          />
        </motion.div>
      </div>
      <span
        className={cn(
          "text-lg font-bold font-mono transition-colors duration-300",
          streak > 0 ? "text-text" : "text-muted"
        )}
      >
        {streak}
      </span>
    </div>
  );
};
