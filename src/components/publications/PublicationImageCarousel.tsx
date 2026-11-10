'use client';

import { useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useMessages } from '@/lib/i18n/useMessages';
import { classifyPreviewOrientation } from '@/lib/publicationPreview.mjs';
import { withBasePath } from '@/lib/sitePath.mjs';
import { cn } from '@/lib/utils';

interface PublicationImageCarouselProps {
    images: string[];
    title: string;
}

type Orientation = 'landscape' | 'portrait';

const SWIPE_THRESHOLD = 50;

export default function PublicationImageCarousel({ images, title }: PublicationImageCarouselProps) {
    const messages = useMessages();
    const prefersReducedMotion = useReducedMotion();
    const [activeIndex, setActiveIndex] = useState(0);
    const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
    const [orientations, setOrientations] = useState<Record<string, Orientation>>({});

    const availableImages = useMemo(
        () => images.filter((image, index) => image && images.indexOf(image) === index && !failedImages.has(image)),
        [failedImages, images],
    );
    const currentIndex = availableImages.length > 0
        ? Math.min(activeIndex, availableImages.length - 1)
        : 0;
    const currentImage = availableImages[currentIndex];
    const hasMultipleImages = availableImages.length > 1;
    const orientation = currentImage ? orientations[currentImage] || 'landscape' : 'landscape';

    useEffect(() => {
        if (activeIndex !== currentIndex) setActiveIndex(currentIndex);
    }, [activeIndex, currentIndex]);

    if (!currentImage) return null;

    const previous = () => {
        if (!hasMultipleImages) return;
        setActiveIndex((currentIndex - 1 + availableImages.length) % availableImages.length);
    };

    const next = () => {
        if (!hasMultipleImages) return;
        setActiveIndex((currentIndex + 1) % availableImages.length);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (!hasMultipleImages) return;
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            previous();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            next();
        }
    };

    const positionLabel = messages.publications.imagePosition
        .replace('{current}', String(currentIndex + 1))
        .replace('{total}', String(availableImages.length));

    return (
        <div
            className="flex h-72 w-full md:w-48 flex-shrink-0 items-center justify-center"
            role="region"
            aria-label={`${messages.publications.imageGallery}: ${title}`}
            tabIndex={hasMultipleImages ? 0 : -1}
            onKeyDown={handleKeyDown}
        >
            <div
                className={cn(
                    'relative overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800',
                    orientation === 'portrait'
                        ? 'h-full max-w-full aspect-[9/16]'
                        : 'w-full max-w-96 md:max-w-full aspect-[4/3]',
                )}
            >
                <AnimatePresence initial={false} mode="wait">
                    <motion.div
                        key={currentImage}
                        className="absolute inset-0"
                        initial={prefersReducedMotion ? false : { opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0, x: -12 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={hasMultipleImages ? 0.12 : 0}
                        onDragEnd={(_, info) => {
                            if (!hasMultipleImages || Math.abs(info.offset.x) < SWIPE_THRESHOLD) return;
                            if (info.offset.x < 0) next();
                            else previous();
                        }}
                    >
                        <Image
                            src={withBasePath(`/papers/${currentImage}`)}
                            alt={`${title} - ${positionLabel}`}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 192px"
                            onLoad={(event) => {
                                const image = event.currentTarget;
                                const nextOrientation = classifyPreviewOrientation(
                                    image.naturalWidth,
                                    image.naturalHeight,
                                );
                                setOrientations((current) => (
                                    current[currentImage] === nextOrientation
                                        ? current
                                        : { ...current, [currentImage]: nextOrientation }
                                ));
                            }}
                            onError={() => {
                                setFailedImages((current) => new Set(current).add(currentImage));
                            }}
                        />
                    </motion.div>
                </AnimatePresence>

                {hasMultipleImages && (
                    <>
                        <button
                            type="button"
                            onClick={previous}
                            className="absolute left-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                            aria-label={messages.publications.previousImage}
                            title={messages.publications.previousImage}
                        >
                            <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={next}
                            className="absolute right-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                            aria-label={messages.publications.nextImage}
                            title={messages.publications.nextImage}
                        >
                            <ChevronRightIcon className="h-5 w-5" />
                        </button>

                        <div className="absolute inset-x-0 bottom-2 z-10 flex items-center justify-center gap-1.5">
                            {availableImages.map((image, index) => (
                                <button
                                    key={image}
                                    type="button"
                                    onClick={() => setActiveIndex(index)}
                                    className="group grid h-6 w-6 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                    aria-label={messages.publications.imagePosition
                                        .replace('{current}', String(index + 1))
                                        .replace('{total}', String(availableImages.length))}
                                    aria-current={index === currentIndex ? 'true' : undefined}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            'h-2 rounded-full shadow-sm transition-[width,background-color]',
                                            index === currentIndex ? 'w-5 bg-accent' : 'w-2 bg-white/80 group-hover:bg-white',
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                        <span
                            className="absolute right-2 top-2 z-10 rounded bg-black/65 px-2 py-0.5 text-xs tabular-nums text-white"
                            aria-live="polite"
                        >
                            {currentIndex + 1} / {availableImages.length}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}
