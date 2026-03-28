import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Command } from "lucide-react";

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  // Simulate an initial heavy loading phase
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#07080A] selection:bg-none"
          >
            {/* Glowing orb background effect */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.2, 1], opacity: [0, 0.5, 0] }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="absolute h-96 w-96 rounded-full bg-indigo-600/20 blur-[100px]"
            />
            
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
              className="relative flex flex-col items-center"
            >
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500 shadow-[0_0_80px_rgba(99,102,241,0.4)]">
                <Command className="h-10 w-10 text-white" />
                
                {/* Ping animation around the logo */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl border-2 border-indigo-400"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                />
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 text-2xl font-bold tracking-tight text-white"
              >
                TaskCraft
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 120 }}
                transition={{ delay: 1.2, duration: 0.8, ease: "easeInOut" }}
                className="mt-6 flex h-1 w-32 overflow-hidden rounded-full bg-white/5"
              >
                <div className="h-full w-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.5, delay: loading ? 0 : 0.8 }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </>
  );
}
