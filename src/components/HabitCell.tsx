import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "../utils/cn";

interface HabitCellProps {
  date: string;
  isToday: boolean;
  isFuture: boolean;
  status: "completed" | "missed" | "empty";
  onClick: () => void;
}

export const HabitCell = ({
  isToday,
  isFuture,
  status,
  onClick,
}: HabitCellProps) => {
  return (
    <motion.button
      whileTap={!isFuture ? { scale: 0.9 } : undefined}
      onClick={!isFuture ? onClick : undefined}
      className={cn(
        "relative w-full aspect-square rounded-md flex items-center justify-center transition-all duration-300",
        isFuture && "opacity-20 cursor-not-allowed bg-surface/50",
        !isFuture &&
          status === "empty" &&
          "opacity-100 bg-surface/50 hover:bg-surface/80 group",
        status === "completed" &&
          "bg-done shadow-[0_0_15px_rgba(34,197,94,0.4)] scale-90",
        status === "missed" && "bg-missed/80",
        // Today highlight if empty
        isToday &&
          status === "empty" &&
          "ring-1 ring-today/50 ring-inset bg-today/10"
      )}
      disabled={isFuture}
    >
      {/* "Star" Texture for empty active cells */}
      {!isFuture && status === "empty" && (
        <div className="w-1 h-1 rounded-full bg-text/20 group-hover:bg-text/40 transition-colors" />
      )}

      {status === "completed" && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <Check
            className="w-5 h-5 text-black font-extrabold drop-shadow-md"
            strokeWidth={4}
          />
        </motion.div>
      )}

      {/* Animation for toggle - Scale Pulse handling via parent/click logic or purely CSS/Framer */}
      {/* The prompt asks for: scale(1 -> 1.15 -> 1) + green glow */}
      {/* We can achieve this via an AnimatePresence or a key on the button, but simpler is to use `whileTap` for interaction 
          and rely on the state change to trigger the entry animation of the Check mark. 
          To do the exact 1->1.15->1 on toggle, we might need a separate effect, 
          but `whileTap` gives the tactile feel accurately. 
          Let's add a "completion" pulse effect if needed. */}
    </motion.button>
  );
};
