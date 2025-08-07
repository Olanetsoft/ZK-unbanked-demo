"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Fingerprint,
  Shield,
  Coins,
  Vote,
  Send,
  Globe,
  Sparkles,
  ChevronRight,
  Award,
  Users,
  Zap,
  Lock,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { IdentityVerification } from "@/components/identity/VerificationFlow";
import { ReputationDashboard } from "@/components/reputation/ReputationDashboard";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { ParticleField } from "@/components/ui/ParticleField";

// Dynamically import the 3D scene to prevent SSR issues
const ThreeScene = dynamic(() => import("@/components/ThreeScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg" />
  ),
});

// Main App Component
export default function Home() {
  const [currentStep, setCurrentStep] = useState<
    "intro" | "verify" | "reputation" | "services"
  >("intro");
  const [isIdentityVerified, setIsIdentityVerified] = useState(false);
  const [reputationScore, setReputationScore] = useState(0);
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
  const [attestations, setAttestations] = useState<any[]>([]);
  const [isProductionMode, setIsProductionMode] = useState(false);

  // Check mode and setup effects on mount
  useEffect(() => {
    // Check if we're in production mode
    const mockMode = process.env.NEXT_PUBLIC_SELF_MOCK_MODE === "true";
    setIsProductionMode(!mockMode);

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      document.documentElement.style.setProperty("--mouse-x", `${x}`);
      document.documentElement.style.setProperty("--mouse-y", `${y}`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleVerificationComplete = (identifier: string) => {
    setIsIdentityVerified(true);
    setUserIdentifier(identifier);
    setCurrentStep("reputation");
    toast.success("Identity verified! Welcome to the decentralized economy.", {
      icon: "🎉",
      style: {
        borderRadius: "10px",
        background: "#1a1a2e",
        color: "#fff",
        border: "1px solid #7c3aed",
      },
    });
  };

  const handleAttestationAdded = (newAttestation: any) => {
    setAttestations([...attestations, newAttestation]);
    setReputationScore(reputationScore + newAttestation.score);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden flex flex-col">
      {/* Animated background */}
      <div className="fixed inset-0 -z-50">
        <ThreeScene />
      </div>

      {/* Gradient Overlay - Above background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 -z-40" />

      {/* Particle Field - Above gradient */}
      <div className="fixed inset-0 -z-30">
        <ParticleField />
      </div>

      {/* Navigation Header - Proper layer above background */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="relative z-40 backdrop-blur-xl bg-black/30 border-b border-white/10 sticky top-0"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50" />
                <Shield className="w-8 sm:w-10 h-8 sm:h-10 text-purple-400 relative z-10" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  ZK Identity
                </h1>
                <p className="text-xs text-gray-400 hidden sm:block">
                  Financial Freedom for All
                </p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-3 sm:space-x-6">
              {/* Mode Indicator */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full border ${
                  isProductionMode
                    ? "bg-blue-500/20 border-blue-500/50"
                    : "bg-yellow-500/20 border-yellow-500/50"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isProductionMode ? "bg-blue-400" : "bg-yellow-400"
                  }`}
                />
                <span
                  className={`text-xs sm:text-sm font-medium ${
                    isProductionMode ? "text-blue-400" : "text-yellow-400"
                  }`}
                >
                  {isProductionMode ? "Production" : "Demo"}
                </span>
              </motion.div>

              {isIdentityVerified && (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full bg-green-500/20 border border-green-500/50"
                  >
                    <CheckCircle2 className="w-3 sm:w-4 h-3 sm:h-4 text-green-400" />
                    <span className="text-xs sm:text-sm font-medium text-green-400 hidden sm:inline">
                      Verified
                    </span>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/50"
                  >
                    <Award className="w-3 sm:w-4 h-3 sm:h-4 text-purple-400" />
                    <span className="text-xs sm:text-sm font-medium text-purple-400">
                      {reputationScore}
                    </span>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content - Above header but below modals */}
      <main className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-grow">
        <AnimatePresence mode="wait">
          {currentStep === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="mb-8 relative inline-block"
              >
                <div className="absolute inset-0 bg-purple-600 blur-3xl opacity-30 animate-pulse" />
                <Fingerprint className="w-32 h-32 text-purple-400 relative z-10" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent text-center"
              >
                Identity Without Borders
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4"
              >
                Join{" "}
                <span className="text-purple-400 font-semibold">
                  1 billion unbanked
                </span>{" "}
                people gaining access to the digital economy. No documents, no
                banks, just your phone and complete privacy.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-4xl mx-auto px-4"
              >
                {[
                  {
                    icon: Lock,
                    title: "100% Private",
                    desc: "Zero personal data exposed",
                  },
                  {
                    icon: Zap,
                    title: "Instant Access",
                    desc: "Financial services in seconds",
                  },
                  {
                    icon: Globe,
                    title: "Global Scale",
                    desc: "Works everywhere, for everyone",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, rotateY: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <GlassCard className="p-6 cursor-pointer group">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-purple-600 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
                        <item.icon className="w-12 h-12 text-purple-400 mx-auto relative z-10" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <NeonButton
                  onClick={() => setCurrentStep("verify")}
                  size="lg"
                  className="group"
                >
                  <span className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Begin Your Journey</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </NeonButton>
              </motion.div>

              {/* Stats Banner */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-16 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4"
              >
                {[
                  { value: "1.7B", label: "Unbanked Adults" },
                  { value: "$8.5T", label: "Untapped Market" },
                  { value: "0", label: "Documents Needed" },
                  { value: "100%", label: "Privacy Protected" },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {currentStep === "verify" && (
            <IdentityVerification
              onComplete={handleVerificationComplete}
              onBack={() => setCurrentStep("intro")}
            />
          )}

          {currentStep === "reputation" && (
            <ReputationDashboard
              userIdentifier={userIdentifier!}
              score={reputationScore}
              attestations={attestations}
              onAttestationAdded={handleAttestationAdded}
              onContinue={() => setCurrentStep("services")}
            />
          )}

          {currentStep === "services" && (
            <ServiceGrid
              userIdentifier={userIdentifier!}
              reputationScore={reputationScore}
              onBack={() => setCurrentStep("reputation")}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-20 mt-auto py-6 sm:py-8 border-t border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs sm:text-sm text-gray-400">
            Built with Self Protocol • Empowering the unbanked with dignity and
            privacy
          </p>
          <div className="flex items-center justify-center space-x-4 sm:space-x-6 mt-3 sm:mt-4">
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-purple-400 transition-colors"
            >
              Documentation
            </a>
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-purple-400 transition-colors"
            >
              GitHub
            </a>
            <a
              href="#"
              className="text-xs text-gray-500 hover:text-purple-400 transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </motion.footer>

      <Toaster position="bottom-right" />
    </div>
  );
}
