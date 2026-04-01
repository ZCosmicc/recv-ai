'use client';

import { ReactLenis } from 'lenis/react';

export default function LenisProvider({ children }: { children: React.ReactNode }) {
    return (
        <ReactLenis root options={{
            lerp: 0.15,        // Increased from 0.1 for a snappier, less "floaty" stop
            wheelMultiplier: 1.2, // Makes each scroll wheel tick move further (feels lighter/faster)
        }}>
            {children}
        </ReactLenis>
    );
}
