"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fingerprint,
  Shield,
  Smartphone,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Cpu,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { SelfQRWrapper } from "./SelfQRWrapper";
import toast from "react-hot-toast";

interface IdentityVerificationProps {
  onComplete: (identifier: string) => void;
  onBack: () => void;
}

export const IdentityVerification: React.FC<IdentityVerificationProps> = ({
  onComplete,
  onBack,
}) => {
  const [verificationStep, setVerificationStep] = useState<
    "intro" | "qr" | "processing" | "complete"
  >("intro");
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false);
  const [simulationMode, setSimulationMode] = useState(
    process.env.NEXT_PUBLIC_SELF_MOCK_MODE === "true"
  ); // Use environment variable to control mode

  const handleVerificationSuccess = (
    userIdentifier: string,
    disclosures?: any
  ) => {
    console.log("🎉 Verification successful:", { userIdentifier, disclosures });
    setVerificationStep("processing");

    // Simulate processing for UI effect
    setTimeout(() => {
      setVerificationStep("complete");
      setTimeout(() => {
        onComplete(userIdentifier);
      }, 2000);
    }, 1500);
  };

  const handleVerificationError = (error: any) => {
    console.error("❌ Verification error:", error);
    // Could add error state handling here
    toast.error("Verification failed. Please try again.", {
      style: {
        borderRadius: "10px",
        background: "#1a1a2e",
        color: "#fff",
        border: "1px solid #ef4444",
      },
    });
  };

  const privacyFeatures = [
    {
      icon: Lock,
      title: "Zero-Knowledge Proofs",
      description: "Prove you're unique without revealing who you are",
    },
    {
      icon: Eye,
      title: "No Data Storage",
      description: "Your biometric data never leaves your device",
    },
    {
      icon: Shield,
      title: "Sybil Resistant",
      description: "Mathematical guarantee of one person, one identity",
    },
    {
      icon: Cpu,
      title: "Decentralized",
      description: "No central authority can access your information",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {verificationStep === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="inline-block relative mb-6"
              >
                <div className="absolute inset-0 bg-purple-600 blur-3xl opacity-40" />
                <Fingerprint className="w-24 h-24 text-purple-400 relative z-10" />
              </motion.div>

              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Create Your Anonymous Identity
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                Generate a unique, verifiable identity without revealing any
                personal information
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {privacyFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-6 h-full">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <feature.icon className="w-6 h-6 text-purple-400" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-purple-500/20 mb-8"
            >
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-purple-300">How it works</h3>
              </div>
              <ol className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">1.</span>
                  Your phone generates a unique mathematical proof of your
                  identity
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">2.</span>
                  This proof is verified without transmitting any personal data
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">3.</span>
                  You receive a unique identifier that can't be linked to your
                  real identity
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">4.</span>
                  Use this identifier to access financial services while staying
                  anonymous
                </li>
              </ol>
            </motion.div>

            <div className="flex flex-col items-center space-y-4">
              <NeonButton
                onClick={() => setVerificationStep("qr")}
                size="lg"
                className="min-w-[200px]"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Begin Verification
              </NeonButton>

              <button
                onClick={() => setShowPrivacyDetails(!showPrivacyDetails)}
                className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
              >
                {showPrivacyDetails ? (
                  <EyeOff className="w-4 h-4 inline mr-1" />
                ) : (
                  <Eye className="w-4 h-4 inline mr-1" />
                )}
                {showPrivacyDetails ? "Hide" : "Show"} privacy details
              </button>
            </div>

            {showPrivacyDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-8 p-6 bg-black/40 rounded-xl border border-white/10"
              >
                <h4 className="font-semibold mb-3">
                  Technical Privacy Guarantees:
                </h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Uses zk-SNARKs for cryptographic proof generation</li>
                  <li>• No biometric data leaves your device</li>
                  <li>• Nullifier prevents duplicate registrations</li>
                  <li>
                    • No correlation between real identity and blockchain
                    address
                  </li>
                  <li>• Open source and auditable protocol</li>
                </ul>
              </motion.div>
            )}
          </motion.div>
        )}

        {verificationStep === "qr" && (
          <motion.div
            key="qr"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <h3 className="text-2xl font-bold mb-8">Scan with Self App</h3>

            <div className="flex justify-center mb-8">
              <SelfQRWrapper
                onSuccess={handleVerificationSuccess}
                onError={handleVerificationError}
                simulationMode={simulationMode}
              />
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 mb-6">
              <Smartphone className="w-4 h-4" />
              <span>Open the Self app on your phone and scan this code</span>
            </div>

            {simulationMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 max-w-md mx-auto"
              >
                <p className="text-sm text-yellow-300">
                  Demo Mode: Click the QR code to simulate verification
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {verificationStep === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-8"
            >
              <div className="w-24 h-24 border-4 border-purple-500/30 border-t-purple-500 rounded-full" />
            </motion.div>

            <h3 className="text-2xl font-bold mb-4">
              Generating Zero-Knowledge Proof
            </h3>
            <p className="text-gray-400">Creating your anonymous identity...</p>

            <div className="mt-8 max-w-md mx-auto">
              <div className="space-y-3">
                {[
                  "Generating cryptographic proof",
                  "Verifying uniqueness",
                  "Creating anonymous identifier",
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.5 }}
                    className="flex items-center space-x-3 text-sm"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.5 + 0.3 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </motion.div>
                    <span className="text-gray-300">{step}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {verificationStep === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="inline-block mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 blur-3xl opacity-40" />
                <CheckCircle className="w-32 h-32 text-green-400 relative z-10" />
              </div>
            </motion.div>

            <h3 className="text-3xl font-bold mb-4 text-green-400">
              Identity Created!
            </h3>
            <p className="text-lg text-gray-300">
              You now have a verified, anonymous identity on the blockchain
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
