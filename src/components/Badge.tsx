import { motion } from "framer-motion";
import { cn } from "../utils/cn";
import * as LucideIcons from "lucide-react";
import type { Tier } from "../utils/achievements";

interface BadgeProps {
  tier: Tier;
  icon: string;
  isUnlocked: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Badge = ({
  tier,
  icon,
  isUnlocked,
  className,
  size = "md",
}: BadgeProps) => {
  // Dynamic Icon
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Trophy;

  // Size mapping
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  // Tier Visuals (Colors & Shadows)
  const tierStyles = {
    bronze: {
      stroke: "stroke-amber-700",
      fill: "fill-amber-900/20",
      glow: "shadow-amber-900/10",
      iconColor: "text-amber-500",
      borderWidth: 2,
    },
    silver: {
      stroke: "stroke-slate-400",
      fill: "fill-slate-800/20",
      glow: "shadow-blue-900/20",
      iconColor: "text-slate-300",
      borderWidth: 3, // Double stroke simulated via separate path or just thick
    },
    gold: {
      stroke: "stroke-yellow-500",
      fill: "fill-yellow-900/20",
      glow: "shadow-yellow-500/20",
      iconColor: "text-yellow-400",
      borderWidth: 4,
    },
    legendary: {
      stroke: "stroke-emerald-400",
      fill: "fill-emerald-900/30",
      glow: "shadow-emerald-500/40",
      iconColor: "text-emerald-300",
      borderWidth: 2,
    },
  };

  const style = tierStyles[tier];

  // Shapes
  const renderShape = () => {
    switch (tier) {
      case "bronze": // Circle
        return (
          <circle
            cx="50"
            cy="50"
            r="45"
            className={cn(style.stroke, style.fill)}
            strokeWidth={style.borderWidth}
          />
        );
      case "silver": // Hexagon
        return (
          <path
            d="M50 5 L93.3 30 V80 L50 105 L6.7 80 V30 Z"
            transform="scale(0.9) translate(5, 0)" // Adjust for viewBox 0-100
            className={cn(style.stroke, style.fill)}
            strokeWidth={style.borderWidth}
            strokeLinejoin="round"
          />
        );
      case "gold": // Shield
        return (
          <path
            d="M50 5 L90 20 V50 C90 75 75 90 50 100 C25 90 10 75 10 50 V20 Z"
            transform="scale(0.9) translate(5, 0)"
            className={cn(style.stroke, style.fill)}
            strokeWidth={style.borderWidth}
            strokeLinejoin="round"
          />
        );
      case "legendary": // Crown/Crest (Box rotated or complex path)
        return (
          <>
            <defs>
              <linearGradient
                id="legendaryGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <path
              d="M50 5 L85 25 L85 75 L50 95 L15 75 L15 25 Z"
              className={cn(style.fill)}
              stroke="url(#legendaryGradient)"
              strokeWidth={3}
              fillOpacity="0.3"
            />
            {/* Animated Ring */}
            <motion.circle
              cx="50"
              cy="50"
              r="48"
              stroke="url(#legendaryGradient)"
              strokeWidth="1"
              fill="none"
              strokeDasharray="4 4"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
          </>
        );
    }
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none",
        sizeClasses[size],
        className
      )}
    >
      {/* SVG Container */}
      <svg
        viewBox="0 0 100 110"
        className={cn(
          "absolute inset-0 w-full h-full drop-shadow-2xl transition-all duration-500",
          !isUnlocked && "grayscale opacity-30 blur-[1px]",
          isUnlocked && style.glow
        )}
      >
        {renderShape()}
      </svg>

      {/* Icon */}
      <div
        className={cn(
          "z-10 relative transition-all duration-300",
          isUnlocked ? style.iconColor : "text-muted",
          isUnlocked &&
            tier === "legendary" &&
            "drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]"
        )}
      >
        <IconComponent className={iconSizes[size]} />
      </div>

      {/* Locked Overlay Icon */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <LucideIcons.Lock className="w-1/3 h-1/3 text-muted/50" />
        </div>
      )}
    </div>
  );
};
