'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CVPagedContent, { A4_WIDTH_PX, A4_HEIGHT_PX } from './CVPagedContent';
import { CVData, Section } from '../types';

interface CVPreviewPaneProps {
    cvData: CVData;
    sections: Section[];
    selectedTemplate: string | null;
    tier?: 'guest' | 'free' | 'pro';
    /** Additional class names for the outer wrapper */
    className?: string;
}

/**
 * Renders a WYSIWYG A4 preview of the CV.
 * The A4 page is always rendered at full 794px width then scaled to fit
 * the container using CSS transform — what you see is exactly what prints.
 * Prev/Next buttons appear when the CV spans multiple pages.
 */
export default function CVPreviewPane({
    cvData,
    sections,
    selectedTemplate,
    tier = 'free',
    className = '',
}: CVPreviewPaneProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Compute scale whenever container resizes
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const update = () => {
            const w = el.clientWidth;
            if (w > 0) setScale(w / A4_WIDTH_PX);
        };

        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // Count pages by querying rendered pdf-page divs
    useEffect(() => {
        const count = () => {
            const pages = document.querySelectorAll('[data-pdf-page="true"]');
            const n = Math.max(1, pages.length);
            setTotalPages(n);
            setCurrentPage(c => Math.min(c, n - 1));
        };
        // Delay to let CVPagedContent finish rendering + paginating
        const t = setTimeout(count, 200);
        return () => clearTimeout(t);
    }, [cvData, sections, selectedTemplate]);

    // Reset to page 0 when template changes
    useEffect(() => { setCurrentPage(0); }, [selectedTemplate]);

    const scaledHeight = Math.round(A4_HEIGHT_PX * scale);

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            {/* Navigation controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className="p-1.5 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium text-gray-600 tabular-nums">
                        Page {currentPage + 1} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage === totalPages - 1}
                        className="p-1.5 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Next page"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Preview window — exact container height matches scaled A4 */}
            <div
                ref={containerRef}
                className="w-full overflow-hidden bg-gray-100 rounded border border-gray-200 shadow-inner"
                style={{ height: `${scaledHeight}px` }}
            >
                {/* Scroll container that shows only the current page */}
                <div
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        width: `${A4_WIDTH_PX}px`,
                        // Show only one page at a time by translating vertically
                        marginTop: `-${currentPage * A4_HEIGHT_PX}px`,
                        transition: 'margin-top 0.3s ease',
                    }}
                >
                    <CVPagedContent
                        cvData={cvData}
                        sections={sections}
                        selectedTemplate={selectedTemplate}
                        tier={tier}
                        pageIdPrefix="preview-page"
                    />
                </div>
            </div>
        </div>
    );
}
