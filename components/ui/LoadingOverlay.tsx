// components/ui/LoadingOverlay.jsx
"use client";

import { motion } from 'framer-motion';

const LoadingSpinner = () => (
  <motion.div
    className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  />
);

const pulseVariants = {
  initial: { scale: 0.8, opacity: 0.3 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  }
};

const LoadingOverlay = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="relative">
        <LoadingSpinner />
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          className="absolute inset-0 bg-indigo-500/20 rounded-full -z-10"
        />
      </div>
      <motion.p 
        className="mt-4 text-white font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {message}
      </motion.p>
    </div>
  );
};

export default LoadingOverlay;