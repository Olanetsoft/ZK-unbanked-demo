import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  variant?: "default" | "dark" | "purple" | "blue";
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hover = true,
  glow = false,
  variant = "default",
}) => {
  const variants = {
    default: "bg-white/5 border-white/10",
    dark: "bg-black/40 border-white/5",
    purple: "bg-purple-500/10 border-purple-500/20",
    blue: "bg-blue-500/10 border-blue-500/20",
  };

  return (
    <motion.div
      whileHover={
        hover
          ? {
              scale: 1.02,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
            }
          : {}
      }
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative backdrop-blur-xl rounded-2xl border shadow-xl overflow-hidden",
        variants[variant],
        className
      )}
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500" />

      {/* Glow effect */}
      {glow && (
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </motion.div>
  );
};
