'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface NeoButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  shadowColor?: string; // e.g. 'rgba(0,0,0,1)'
  hoverTranslate?: number; // default 2
}

export default function NeoButton({ 
  children, 
  className, 
  shadowColor = 'rgba(0,0,0,1)',
  hoverTranslate = 2,
  ...props 
}: NeoButtonProps) {
  
  // Base physics Configuration
  const springConfig = { type: 'spring' as const, stiffness: 400, damping: 25 };

  return (
    <motion.button
      whileHover={{ 
        x: hoverTranslate, 
        y: hoverTranslate, 
        boxShadow: `0px 0px 0px 0px ${shadowColor}` 
      }}
      whileTap={{ scale: 0.96 }}
      transition={springConfig}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}
