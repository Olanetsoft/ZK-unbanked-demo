"use client";

import React from "react";

export default function ThreeScene() {
  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-indigo-900/30 animate-pulse" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-bounce" />
      <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
      <div
        className="absolute bottom-1/3 left-1/2 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl animate-bounce"
        style={{ animationDelay: "1s" }}
      />

      {/* Animated grid overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(124, 58, 237, 0.15) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
            animation: "float 6s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}
