'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ProjectItem } from '@/types/page';
import { withBasePath } from '@/lib/sitePath.mjs';
import { useMessages } from '@/lib/i18n/useMessages';

interface FeaturedProjectsProps {
    projects: ProjectItem[];
    title?: string;
    enableOnePageMode?: boolean;
}

export default function FeaturedProjects({
    projects,
    title,
    enableOnePageMode = false,
}: FeaturedProjectsProps) {
    const messages = useMessages();
    const resolvedTitle = title || messages.home.featuredProjects;

    if (!projects || projects.length === 0) {
        return null;
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-serif font-bold text-primary">{resolvedTitle}</h2>
                <Link
                    href={enableOnePageMode ? '/#projects' : '/projects'}
                    prefetch={true}
                    className="text-accent hover:text-accent-dark text-sm font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm px-2 py-1"
                >
                    {messages.home.viewAll} →
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {projects.map((project, index) => {
                    const href = enableOnePageMode
                        ? `/#projects`
                        : `/projects/#${encodeURIComponent(project.id)}`;
                    const badge = project.status || project.category_label;

                    return (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.08 * index }}
                            className="h-full"
                        >
                            <Link
                                href={href}
                                prefetch={true}
                                className="group flex flex-col h-full rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-[rgba(148,163,184,0.24)] shadow-sm hover:shadow-xl hover:border-accent/50 transition-all duration-300 hover:-translate-y-1"
                            >
                                {project.image && (
                                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                                        <Image
                                            src={withBasePath(project.image)}
                                            alt={project.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 240px"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300" />
                                        {badge && (
                                            <span className="absolute top-2.5 right-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-background/85 text-primary backdrop-blur-md border border-neutral-200/70 dark:border-neutral-700/70 shadow-sm">
                                                {badge}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="p-4 flex flex-col flex-1">
                                    {(project.date || project.role) && (
                                        <div className="flex items-center justify-between gap-2 text-xs font-medium text-accent mb-1.5">
                                            <span className="truncate">{project.role || project.date}</span>
                                            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                                        </div>
                                    )}
                                    <h3 className="font-serif font-semibold text-base text-primary leading-snug mb-1.5 group-hover:text-accent transition-colors line-clamp-2">
                                        {project.title}
                                    </h3>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-500 leading-relaxed line-clamp-2 flex-1">
                                        {project.summary}
                                    </p>

                                    {project.tags && project.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-neutral-200/70 dark:border-neutral-700/60">
                                            {project.tags.slice(0, 2).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-[11px] px-1.5 py-0.5 rounded bg-white dark:bg-neutral-900/70 text-neutral-600 dark:text-neutral-500 border border-neutral-200/80 dark:border-neutral-700/70"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </motion.section>
    );
}
