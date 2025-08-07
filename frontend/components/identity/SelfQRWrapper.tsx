"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, CheckCircle, Smartphone, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
} from "@selfxyz/qrcode";
import { getUniversalLink } from "@selfxyz/core";
import { v4 as uuidv4 } from "uuid";

interface SelfQRWrapperProps {
  onSuccess: (userIdentifier: string, disclosures?: any) => void;
  onError?: (error: any) => void;
  simulationMode?: boolean;
}

export const SelfQRWrapper: React.FC<SelfQRWrapperProps> = ({
  onSuccess,
  onError,
  simulationMode = false,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Initialize Self app
  useEffect(() => {
    try {
      // Generate a unique user ID for this session
      const userId = uuidv4();

      const app = new SelfAppBuilder({
        appName: "ZK Identity for the Unbanked",
        scope: "zk-unbanked-demo",
        endpoint: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/verify`
          : "https://241caff567ec.ngrok-free.app/api/verify",
        userId: userId,
        disclosures: {
          minimumAge: 16,
          excludedCountries: [],
          ofac: false,
          nationality: true,
        },
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
      setError("Failed to initialize verification system");
      onError?.(error);
    }
  }, [onError]);

  const handleVerify = () => {
    if (!simulationMode) return;

    setIsScanning(true);

    // Simulate verification process for demo
    setTimeout(() => {
      setIsScanning(false);
      setIsVerified(true);

      setTimeout(() => {
        const mockUserIdentifier = uuidv4();
        onSuccess(mockUserIdentifier, {
          nationality: "Global",
          minimumAge: true,
          verification_time: new Date().toISOString(),
        });
      }, 1500);
    }, 2000);
  };

  const handleSuccessfulVerification = (result?: any) => {
    console.log("✅ Self Protocol verification successful!", result);
    setIsVerified(true);

    // Extract user data from the verification result
    const userIdentifier =
      result?.userIdentifier ||
      result?.credentialSubject?.userIdentifier ||
      uuidv4();
    const disclosures = result?.credentialSubject ||
      result?.disclosures || {
        nationality: "Verified",
        minimumAge: true,
        verification_time: new Date().toISOString(),
      };

    // Call the parent's onSuccess callback to proceed to next step
    onSuccess(userIdentifier, disclosures);
  };

  const handleVerificationError = (error: any) => {
    console.error("❌ Self Protocol verification failed:", error);
    setError("Verification failed. Please try again.");
    onError?.(error);
  };

  // Show error state if configuration failed
  if (error) {
    return (
      <GlassCard className="p-8 inline-block" glow>
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">❌</div>
          <p className="text-red-400 font-semibold mb-2">Configuration Error</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </GlassCard>
    );
  }

  // Show production Self QR code
  if (!simulationMode && selfApp) {
    return (
      <div className="text-center">
        <SelfQRcodeWrapper
          selfApp={selfApp}
          onSuccess={handleSuccessfulVerification}
          onError={handleVerificationError}
        />
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <Smartphone className="w-4 h-4" />
            <span>Scan with Self app on your phone</span>
          </div>
          {/* Mobile users can tap to open app directly */}
          {universalLink && (
            <button
              onClick={() => window.open(universalLink, "_blank")}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Or tap here to open Self app directly
            </button>
          )}
        </div>
      </div>
    );
  }

  // Fallback to simulation mode with enhanced UI
  return (
    <GlassCard className="p-8 inline-block" glow>
      <AnimatePresence mode="wait">
        {!isVerified ? (
          <motion.div
            key="qr"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative"
          >
            {/* QR Code Container */}
            <motion.div
              className={`relative w-64 h-64 rounded-2xl overflow-hidden cursor-pointer ${
                simulationMode ? "hover:scale-105 transition-transform" : ""
              }`}
              onClick={handleVerify}
              whileTap={simulationMode ? { scale: 0.95 } : {}}
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 opacity-10" />

              {/* Demo mode indicator */}
              <div className="absolute top-2 left-2 right-2 z-20">
                <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg px-3 py-1">
                  <p className="text-xs text-yellow-300 text-center font-medium">
                    DEMO MODE
                  </p>
                </div>
              </div>

              {/* Self Protocol logo mockup */}
              <div className="absolute inset-4 bg-white rounded-lg p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <QrCode className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    Self Protocol
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ZK Identity Verification
                  </p>
                  {simulationMode && (
                    <p className="text-xs text-purple-600 mt-2 font-medium">
                      Click to simulate
                    </p>
                  )}
                </div>
              </div>

              {/* Scanning overlay */}
              {isScanning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center z-30"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <RefreshCw className="w-12 h-12 text-white mb-4" />
                    </motion.div>
                    <p className="text-white font-semibold">
                      Generating ZK Proof...
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Instructions */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                <Smartphone className="w-4 h-4" />
                <span>
                  {simulationMode
                    ? "Click to simulate verification"
                    : "Scan with Self app"}
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="verified"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <CheckCircle className="w-24 h-24 text-green-400 mx-auto mb-4" />
            </motion.div>
            <p className="text-xl font-semibold text-green-400">
              ZK Proof Verified!
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Anonymous identity created successfully
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};
