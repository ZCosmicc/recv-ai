'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ComponentProps } from 'react';

const MotionLink = motion(Link);

interface NeoButtonLinkProps extends ComponentProps<typeof MotionLink> {
  children: React.ReactNode;
  shadowColor?: string;
  hoverTranslate?: number;
}

export default function NeoButtonLink({
  children,
  className,
  shadowColor = 'rgba(0,0,0,1)',
  hoverTranslate = 2,
  ...props
}: NeoButtonLinkProps) {
  const springConfig = { type: 'spring' as const, stiffness: 400, damping: 25 };

  return (
    <MotionLink
      whileHover={{
        x: hoverTranslate,
        y: hoverTranslate,
        boxShadow: `0px 0px 0px 0px ${shadowColor}`,
      }}
      whileTap={{ scale: 0.96 }}
      transition={springConfig}
      className={className}
      {...props}
    >
      {children}
    </MotionLink>
  );
}
