import { motion } from "framer-motion";
import { Badge } from "./Badge";
import type { AchievementDef } from "../utils/achievements";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface UnlockOverlayProps {
  achievement: AchievementDef;
  onDismiss: () => void;
}

export const UnlockOverlay = ({
  achievement,
  onDismiss,
}: UnlockOverlayProps) => {
  useEffect(() => {
    // Confetti Burst
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors:
          achievement.tier === "gold"
            ? ["#FFD700", "#FFA500"]
            : ["#ffffff", "#3b82f6"],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors:
          achievement.tier === "gold"
            ? ["#FFD700", "#FFA500"]
            : ["#ffffff", "#3b82f6"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [achievement]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8 text-center"
      onClick={onDismiss}
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ scale: 0.5, rotate: -180 }}
          animate={{ scale: 1.2, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative"
        >
          {/* Radial Burst Behind */}
          <motion.div
            className="absolute inset-0 bg-white/20 blur-3xl rounded-full"
            animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <Badge
            tier={achievement.tier}
            icon={achievement.icon}
            isUnlocked={true}
            size="lg"
            className="drop-shadow-[0_0_50px_rgba(255,255,255,0.3)]"
          />
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-bold text-muted uppercase tracking-[0.2em] mb-2">
            Achievement Unlocked
          </h2>
          <h1 className="text-4xl font-black text-white mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            {achievement.title}
          </h1>
          <p className="text-slate-400 max-w-xs mx-auto">
            {achievement.description}
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 text-xs text-muted/30 animate-pulse"
        >
          Tap to resume
        </motion.p>
      </div>
    </motion.div>
  );
};
