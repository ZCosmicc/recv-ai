'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SlideInProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    id?: string;
    direction?: 'up' | 'down' | 'left' | 'right';
}

export default function SlideIn({ children, delay = 0, className = '', id, direction = 'up' }: SlideInProps) {
    const getInitialDirection = () => {
        switch (direction) {
            case 'up': return { y: 50, opacity: 0 };
            case 'down': return { y: -50, opacity: 0 };
            case 'left': return { x: 50, opacity: 0 };
            case 'right': return { x: -50, opacity: 0 };
            default: return { y: 50, opacity: 0 };
        }
    };

    return (
        <motion.div
            id={id}
            initial={getInitialDirection()}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
                delay: delay
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
