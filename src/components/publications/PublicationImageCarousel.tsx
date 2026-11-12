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

type ImageDimensions = {
    width: number;
    height: number;
};

const SWIPE_THRESHOLD = 50;

export default function PublicationImageCarousel({ images, title }: PublicationImageCarouselProps) {
    const messages = useMessages();
    const prefersReducedMotion = useReducedMotion();
    const [activeIndex, setActiveIndex] = useState(0);
    const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
    const [dimensions, setDimensions] = useState<Record<string, ImageDimensions>>({});

    const availableImages = useMemo(
        () => images.filter((image, index) => image && images.indexOf(image) === index && !failedImages.has(image)),
        [failedImages, images],
    );
    const currentIndex = availableImages.length > 0
        ? Math.min(activeIndex, availableImages.length - 1)
        : 0;
    const currentImage = availableImages[currentIndex];
    const hasMultipleImages = availableImages.length > 1;
    const currentDimensions = currentImage ? dimensions[currentImage] : undefined;
    const orientation: Orientation = currentDimensions
        ? classifyPreviewOrientation(currentDimensions.width, currentDimensions.height)
        : 'landscape';
    const ratio = currentDimensions
        ? currentDimensions.width / currentDimensions.height
        : 4 / 3;
    const aspectRatio = currentDimensions
        ? `${currentDimensions.width} / ${currentDimensions.height}`
        : '4 / 3';

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
            className="flex h-72 sm:h-80 w-full md:w-64 flex-shrink-0 items-center justify-center"
            style={{ containerType: 'size' }}
            role="region"
            aria-label={`${messages.publications.imageGallery}: ${title}`}
            tabIndex={hasMultipleImages ? 0 : -1}
            onKeyDown={handleKeyDown}
        >
            <div
                data-orientation={orientation}
                className="relative overflow-hidden rounded-lg ring-1 ring-neutral-200/80 dark:ring-neutral-700/70 shadow-sm bg-white/80 dark:bg-neutral-900/40"
                style={{
                    width: `min(100cqw, calc(100cqh * ${ratio}))`,
                    aspectRatio,
                }}
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
                            sizes="(max-width: 768px) 100vw, 256px"
                            onLoad={(event) => {
                                const image = event.currentTarget;
                                const { naturalWidth, naturalHeight } = image;
                                if (!naturalWidth || !naturalHeight) return;
                                setDimensions((current) => {
                                    const existing = current[currentImage];
                                    if (
                                        existing &&
                                        existing.width === naturalWidth &&
                                        existing.height === naturalHeight
                                    ) {
                                        return current;
                                    }
                                    return {
                                        ...current,
                                        [currentImage]: { width: naturalWidth, height: naturalHeight },
                                    };
                                });
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

                        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center">
                            <div
                                className={cn(
                                    'pointer-events-auto flex items-center justify-center rounded-full bg-black/50 px-1.5 backdrop-blur-sm',
                                    availableImages.length > 4 ? 'gap-0.5' : 'gap-1.5',
                                )}
                            >
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
