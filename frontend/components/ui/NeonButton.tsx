import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NeonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "purple" | "blue" | "green" | "pink";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  className,
  variant = "purple",
  size = "md",
  glow = true,
  disabled,
  ...props
}) => {
  const variants = {
    purple: {
      bg: "from-purple-600 to-purple-700",
      hover: "hover:from-purple-500 hover:to-purple-600",
      glow: "purple-600",
      border: "border-purple-500/50",
    },
    blue: {
      bg: "from-blue-600 to-blue-700",
      hover: "hover:from-blue-500 hover:to-blue-600",
      glow: "blue-600",
      border: "border-blue-500/50",
    },
    green: {
      bg: "from-green-600 to-green-700",
      hover: "hover:from-green-500 hover:to-green-600",
      glow: "green-600",
      border: "border-green-500/50",
    },
    pink: {
      bg: "from-pink-600 to-pink-700",
      hover: "hover:from-pink-500 hover:to-pink-600",
      glow: "pink-600",
      border: "border-pink-500/50",
    },
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const currentVariant = variants[variant];

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative font-semibold text-white rounded-lg transition-all duration-300",
        "bg-gradient-to-r",
        currentVariant.bg,
        currentVariant.hover,
        "border",
        currentVariant.border,
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {/* Glow effect */}
      {glow && !disabled && (
        <motion.div
          className={cn(
            "absolute inset-0 rounded-lg blur-xl opacity-50",
            `bg-${currentVariant.glow}`
          )}
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>

      {/* Shine effect */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shine_3s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </motion.button>
  );
};
