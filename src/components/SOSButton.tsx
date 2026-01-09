import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface SOSButtonProps {
  onActivate: () => Promise<void>;
  isLoading?: boolean;
  isSuccess?: boolean;
}

export const SOSButton = ({ onActivate, isLoading = false, isSuccess = false }: SOSButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = async () => {
    if (isLoading || isSuccess) return;
    await onActivate();
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Ripple effects */}
      <AnimatePresence>
        {!isSuccess && !isLoading && (
          <>
            <motion.div
              className="absolute w-48 h-48 rounded-full bg-sos/20"
              animate={{
                scale: [1, 2],
                opacity: [0.6, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
            <motion.div
              className="absolute w-48 h-48 rounded-full bg-sos/20"
              animate={{
                scale: [1, 2],
                opacity: [0.6, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.5,
              }}
            />
            <motion.div
              className="absolute w-48 h-48 rounded-full bg-sos/20"
              animate={{
                scale: [1, 2],
                opacity: [0.6, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
                delay: 1,
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        onClick={handleClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        disabled={isLoading}
        className={`relative z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center text-sos-foreground font-bold transition-colors shadow-2xl ${
          isSuccess 
            ? "bg-success" 
            : isLoading 
              ? "bg-sos/80" 
              : "bg-sos hover:bg-sos/90"
        }`}
        style={{
          boxShadow: isSuccess 
            ? "0 0 60px hsl(var(--success) / 0.5)" 
            : "0 0 60px hsl(var(--sos) / 0.5)",
        }}
        whileTap={{ scale: 0.95 }}
        animate={isLoading ? { scale: [1, 1.02, 1] } : {}}
        transition={isLoading ? { duration: 0.8, repeat: Infinity } : {}}
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <CheckCircle2 className="w-16 h-16 mb-2" />
              <span className="text-xl">SENT!</span>
            </motion.div>
          ) : isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-sos-foreground border-t-transparent rounded-full mb-2"
              />
              <span className="text-lg">SENDING...</span>
            </motion.div>
          ) : (
            <motion.div
              key="sos"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <AlertTriangle className="w-16 h-16 mb-2" />
              <span className="text-4xl tracking-wider">SOS</span>
              <span className="text-sm mt-1 opacity-80">Tap for help</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
