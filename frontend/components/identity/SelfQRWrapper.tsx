"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, CheckCircle, Smartphone, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface SelfQRWrapperProps {
  onSuccess: () => void;
  simulationMode?: boolean;
}

export const SelfQRWrapper: React.FC<SelfQRWrapperProps> = ({
  onSuccess,
  simulationMode = true,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [qrPattern, setQrPattern] = useState<boolean[][]>([]);

  // Generate random QR pattern for visual effect
  useEffect(() => {
    const size = 25;
    const pattern = Array(size)
      .fill(null)
      .map(() =>
        Array(size)
          .fill(null)
          .map(() => Math.random() > 0.5)
      );
    setQrPattern(pattern);
  }, []);

  const handleVerify = () => {
    if (!simulationMode) return;

    setIsScanning(true);

    // Simulate verification process
    setTimeout(() => {
      setIsScanning(false);
      setIsVerified(true);

      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2000);
  };

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

              {/* QR Pattern */}
              <div className="absolute inset-4 bg-white rounded-lg p-4">
                <div className="w-full h-full relative">
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-8 border-black border-r-0 border-b-0 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-12 h-12 border-8 border-black border-l-0 border-b-0 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-8 border-black border-r-0 border-t-0 rounded-bl-lg" />

                  {/* QR pattern */}
                  <div className="absolute inset-0 p-3">
                    <div className="grid grid-cols-25 gap-0 w-full h-full">
                      {qrPattern.map((row, i) =>
                        row.map((cell, j) => (
                          <motion.div
                            key={`${i}-${j}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: cell ? 1 : 0 }}
                            transition={{ delay: (i + j) * 0.001 }}
                            className="bg-black"
                            style={{ aspectRatio: "1/1" }}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Center logo */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                      <QrCode className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Scanning overlay */}
              {isScanning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center"
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
                    <p className="text-white font-semibold">Verifying...</p>
                  </div>
                </motion.div>
              )}

              {/* Scan line animation */}
              {!isScanning && (
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                  animate={{
                    top: ["0%", "100%", "0%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              )}
            </motion.div>

            {/* Instructions */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                <Smartphone className="w-4 h-4" />
                <span>
                  {simulationMode
                    ? "Click to simulate scan"
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
              Verification Complete!
            </p>
            <p className="text-sm text-gray-400 mt-2">
              No personal data was revealed
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};
