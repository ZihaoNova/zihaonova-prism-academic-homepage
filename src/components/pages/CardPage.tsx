'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Award, Briefcase, GraduationCap, MapPin, Mic, Users, type LucideIcon } from 'lucide-react';
import { CardItem, CardPageConfig, CardSection } from '@/types/page';
import { withBasePath } from '@/lib/sitePath.mjs';

const sectionIcons: Record<string, LucideIcon> = {
    briefcase: Briefcase,
    education: GraduationCap,
    'graduation-cap': GraduationCap,
    mic: Mic,
    talk: Mic,
    award: Award,
    users: Users,
};

// Sort key from the first "YYYY" or "YYYY.MM" in the date string (newest first).
function dateSortKey(date?: string): number {
    const match = date?.match(/(\d{4})(?:[.\-/](\d{1,2}))?(?:[.\-/](\d{1,2}))?/);
    if (!match) return -Infinity;
    return Number(match[1]) * 10000 + Number(match[2] || 0) * 100 + Number(match[3] || 0);
}

function isOngoing(date?: string): boolean {
    return /present|now|至今|今/i.test(date || '');
}

function sortByDateDesc(items: CardItem[]): CardItem[] {
    return [...items].sort((a, b) => {
        const diff = dateSortKey(b.date) - dateSortKey(a.date);
        if (diff !== 0) return diff;
        return Number(isOngoing(b.date)) - Number(isOngoing(a.date));
    });
}

function TimelineSections({ sections, embedded }: { sections: CardSection[]; embedded: boolean }) {
    return (
        <div className={embedded ? 'space-y-8' : 'space-y-12'}>
            {sections.map((section, sectionIndex) => {
                const Icon = (section.icon && sectionIcons[section.icon]) || Briefcase;
                return (
                    <motion.section
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * sectionIndex }}
                    >
                        <h2 className="flex items-center gap-3 text-2xl font-serif font-bold text-primary mb-6">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                                <Icon className="h-5 w-5" />
                            </span>
                            {section.title}
                        </h2>

                        <ol className="relative ml-[1.1rem] border-l-2 border-neutral-200 dark:border-neutral-800 space-y-5">
                            {sortByDateDesc(section.items).map((item, index) => (
                                <li key={`${item.title}-${index}`} className="relative pl-6">
                                    <span
                                        aria-hidden="true"
                                        className={`absolute -left-[7px] top-6 h-3 w-3 rounded-full ring-4 ring-background ${isOngoing(item.date) ? 'bg-accent' : 'bg-neutral-300 dark:bg-neutral-600'}`}
                                    />
                                    <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2 text-sm">
                                            {item.date && (
                                                <span className="font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded tabular-nums">
                                                    {item.date}
                                                </span>
                                            )}
                                            {item.location && (
                                                <span className="inline-flex items-center gap-1 text-neutral-500">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {item.location}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-semibold text-primary leading-snug">{item.title}</h3>
                                        {item.subtitle && (
                                            <p className="text-accent font-medium mt-1">{item.subtitle}</p>
                                        )}
                                        {item.content && (
                                            <div className="mt-3 text-sm text-neutral-600 dark:text-neutral-500 leading-relaxed">
                                                <ReactMarkdown components={markdownComponents}>{item.content}</ReactMarkdown>
                                            </div>
                                        )}
                                        {item.tags && item.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {item.tags.map((tag) => (
                                                    <span key={tag} className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 px-2 py-1 rounded border border-neutral-100 dark:border-neutral-800">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </motion.section>
                );
            })}
        </div>
    );
}

const markdownComponents = {
    p: ({ children }: React.ComponentProps<'p'>) => <p className="mb-3 last:mb-0">{children}</p>,
    ul: ({ children }: React.ComponentProps<'ul'>) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
    ol: ({ children }: React.ComponentProps<'ol'>) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
    li: ({ children }: React.ComponentProps<'li'>) => <li className="mb-1">{children}</li>,
    a: ({ ...props }) => (
        <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
        />
    ),
    blockquote: ({ children }: React.ComponentProps<'blockquote'>) => (
        <blockquote className="border-l-4 border-accent/50 pl-4 italic my-4 text-neutral-600 dark:text-neutral-500">
            {children}
        </blockquote>
    ),
    strong: ({ children }: React.ComponentProps<'strong'>) => <strong className="font-semibold text-primary">{children}</strong>,
    em: ({ children }: React.ComponentProps<'em'>) => <em className="italic">{children}</em>,
    code: ({ children }: React.ComponentProps<'code'>) => (
        <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[0.95em]">{children}</code>
    ),
};

export default function CardPage({ config, embedded = false }: { config: CardPageConfig; embedded?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className={embedded ? "mb-4" : "mb-8"}>
                <h1 className={`${embedded ? "text-2xl" : "text-4xl"} font-serif font-bold text-primary mb-4`}>{config.title}</h1>
                {config.description && (
                    <div className={`${embedded ? "text-base" : "text-lg"} text-neutral-600 dark:text-neutral-500 max-w-2xl leading-relaxed`}>
                        <ReactMarkdown components={markdownComponents}>
                            {config.description}
                        </ReactMarkdown>
                    </div>
                )}
            </div>

            {config.sections && config.sections.length > 0 && (
                <TimelineSections sections={config.sections} embedded={embedded} />
            )}

            {config.items && config.items.length > 0 && (
            <div className={`grid ${embedded ? "gap-4" : "gap-6"}`}>
                {config.items.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className={`bg-white dark:bg-neutral-900 ${embedded ? "p-4" : "p-6"} rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-200 hover:scale-[1.01]`}
                    >
                        {item.image && (
                            <div className="relative mb-4 aspect-video overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                <Image
                                    src={withBasePath(item.image)}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    sizes={embedded ? "(max-width: 1024px) 100vw, 640px" : "(max-width: 1024px) 100vw, 768px"}
                                />
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-2">
                            <h3 className={`${embedded ? "text-lg" : "text-xl"} font-semibold text-primary`}>{item.title}</h3>
                            {item.date && (
                                <span className="text-sm text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                                    {item.date}
                                </span>
                            )}
                        </div>
                        {item.subtitle && (
                            <p className={`${embedded ? "text-sm" : "text-base"} text-accent font-medium mb-3`}>{item.subtitle}</p>
                        )}
                        {item.content && (
                            <div className={`${embedded ? "text-sm" : "text-base"} text-neutral-600 dark:text-neutral-500 leading-relaxed`}>
                                <ReactMarkdown components={markdownComponents}>
                                    {item.content}
                                </ReactMarkdown>
                            </div>
                        )}
                        {item.tags && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {item.tags.map(tag => (
                                    <span key={tag} className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 px-2 py-1 rounded border border-neutral-100 dark:border-neutral-800">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        {item.link && (
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex text-sm font-medium text-accent transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
                            >
                                Learn more
                            </a>
                        )}
                    </motion.div>
                ))}
            </div>
            )}
        </motion.div>
    );
}
