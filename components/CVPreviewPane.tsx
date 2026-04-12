'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CVPagedContent, { A4_WIDTH_PX, A4_HEIGHT_PX } from './CVPagedContent';
import { CVData, Section } from '../types';

interface CVPreviewPaneProps {
    cvData: CVData;
    sections: Section[];
    selectedTemplate: string | null;
    tier?: 'guest' | 'free' | 'pro';
    className?: string;
    /** unique prefix so multiple panes on the same page don't conflict */
    pageIdPrefix?: string;
    /** target path of the field to highlight (e.g. experience[0].description) */
    highlightedPath?: string | null;
    /** all target paths of the fields that have been suggested for improvement */
    suggestedPaths?: string[];
}

export default function CVPreviewPane({
    cvData,
    sections,
    selectedTemplate,
    tier = 'free',
    className = '',
    pageIdPrefix = 'preview-page',
    highlightedPath = null,
    suggestedPaths = [],
}: CVPreviewPaneProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Compute scale from container width
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

    // Count pages — query by our specific prefix to avoid counting other panes' pages
    const countPages = useCallback(() => {
        const pages = document.querySelectorAll(`[data-pdf-page="${pageIdPrefix}"]`);
        const n = Math.max(1, pages.length);
        setTotalPages(n);
        setCurrentPage(c => Math.min(c, n - 1));
    }, [pageIdPrefix]);

    useEffect(() => {
        const t = setTimeout(countPages, 300);
        return () => clearTimeout(t);
    }, [cvData, sections, selectedTemplate, countPages]);

    // Reset to page 0 on template change
    useEffect(() => { setCurrentPage(0); }, [selectedTemplate]);

    const scaledHeight = Math.round(A4_HEIGHT_PX * scale);

    // Page offset in SCREEN space — must be outside the transform
    // We use an absolutely-positioned wrapper that shifts by scaledHeight per page
    const pageOffsetPx = currentPage * scaledHeight;

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            {/* Navigation */}
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

            {/* Preview viewport — clips to exactly one A4 page height */}
            <div
                ref={containerRef}
                className="w-full overflow-hidden bg-gray-100 rounded border border-gray-200 shadow-inner"
                style={{ height: `${scaledHeight}px`, position: 'relative' }}
            >
                {/*
                  * Page offset is applied HERE in screen space (outside transform),
                  * so it is NOT affected by the scale factor.
                  * Moving up by `currentPage * scaledHeight` shows the correct page.
                  */}
                <div
                    style={{
                        position: 'absolute',
                        top: `-${pageOffsetPx}px`,
                        left: 0,
                        transition: 'top 0.3s ease',
                    }}
                >
                    {/* Scale is applied to the A4 content ONLY — not to the offset */}
                    <div
                        style={{
                            transform: `scale(${scale})`,
                            transformOrigin: 'top left',
                            width: `${A4_WIDTH_PX}px`,
                        }}
                    >
                        <CVPagedContent
                            cvData={cvData}
                            sections={sections}
                            selectedTemplate={selectedTemplate}
                            tier={tier}
                            pageIdPrefix={pageIdPrefix}
                            highlightedPath={highlightedPath}
                            suggestedPaths={suggestedPaths}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
