'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    Award,
    Calendar,
    ExternalLink,
    FileText,
    FolderGit2,
    Github,
    Globe,
    Layers,
    Maximize2,
    Sparkles,
    UserCheck,
    X,
} from 'lucide-react';
import { ProjectItem, ProjectLink, ProjectsPageConfig } from '@/types/page';
import { withBasePath } from '@/lib/sitePath.mjs';
import { useMessages } from '@/lib/i18n/useMessages';

function LinkIcon({ kind }: { kind?: ProjectLink['kind'] }) {
    switch (kind) {
        case 'code':
            return <Github className="h-3.5 w-3.5" />;
        case 'paper':
            return <FileText className="h-3.5 w-3.5" />;
        case 'patent':
            return <Award className="h-3.5 w-3.5" />;
        case 'website':
            return <Globe className="h-3.5 w-3.5" />;
        default:
            return <ExternalLink className="h-3.5 w-3.5" />;
    }
}

function ProjectMetaRow({
    project,
    roleLabel,
    fundingLabel,
}: {
    project: ProjectItem;
    roleLabel: string;
    fundingLabel: string;
}) {
    if (!project.date && !project.role && !project.funding && !project.code_id) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-neutral-600 dark:text-neutral-500 mb-3">
            {project.date && (
                <span className="inline-flex items-center gap-1 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded tabular-nums">
                    <Calendar className="h-3 w-3 text-accent" />
                    {project.date}
                </span>
            )}
            {project.role && (
                <span className="inline-flex items-center gap-1 font-medium text-accent">
                    <UserCheck className="h-3 w-3" />
                    <span className="sr-only">{roleLabel}: </span>
                    {project.role}
                </span>
            )}
            {project.funding && (
                <span className="inline-flex items-center gap-1">
                    <Layers className="h-3 w-3 text-neutral-400" />
                    <span className="sr-only">{fundingLabel}: </span>
                    {project.funding}
                </span>
            )}
            {project.code_id && (
                <span className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded border border-neutral-200/70 dark:border-slate-700/70">
                    {project.code_id}
                </span>
            )}
        </div>
    );
}

function ProjectActions({
    project,
    detailsLabel,
    onOpenDetails,
}: {
    project: ProjectItem;
    detailsLabel: string;
    onOpenDetails: (project: ProjectItem) => void;
}) {
    const hasLinks = project.links && project.links.length > 0;
    const hasDetails = Boolean(project.description);

    if (!hasLinks && !hasDetails) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            {project.links?.map((link) => (
                <a
                    key={`${link.label}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-primary hover:bg-accent hover:text-white transition-colors duration-200"
                >
                    <LinkIcon kind={link.kind} />
                    <span>{link.label}</span>
                </a>
            ))}
            {hasDetails && (
                <button
                    type="button"
                    onClick={() => onOpenDetails(project)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-accent bg-accent/10 hover:bg-accent/20 transition-colors duration-200 ml-auto"
                >
                    <span>{detailsLabel}</span>
                </button>
            )}
        </div>
    );
}

function FeaturedSpotlightCard({
    project,
    featuredLabel,
    roleLabel,
    fundingLabel,
    detailsLabel,
    onOpenDetails,
}: {
    project: ProjectItem;
    featuredLabel: string;
    roleLabel: string;
    fundingLabel: string;
    detailsLabel: string;
    onOpenDetails: (project: ProjectItem) => void;
}) {
    return (
        <motion.article
            id={project.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="scroll-mt-24 group relative rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 border border-accent/40 dark:border-accent/30 shadow-md hover:shadow-xl transition-all duration-300 mb-8"
        >
            <div className="grid grid-cols-1 md:grid-cols-12">
                {project.image && (
                    <button
                        type="button"
                        onClick={() => onOpenDetails(project)}
                        className="md:col-span-5 relative aspect-[16/10] md:aspect-auto md:min-h-[260px] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 text-left cursor-zoom-in"
                        aria-label={project.title}
                    >
                        <Image
                            src={withBasePath(project.image)}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 40vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent text-white shadow-sm">
                            <Sparkles className="h-3 w-3" />
                            {featuredLabel}
                        </span>
                        <span className="absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/85 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm">
                            <Maximize2 className="h-4 w-4" />
                        </span>
                    </button>
                )}

                <div className={`${project.image ? 'md:col-span-7' : 'md:col-span-12'} p-6 flex flex-col`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        {project.category_label && (
                            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                                {project.category_label}
                            </span>
                        )}
                        {project.status && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/25">
                                {project.status}
                            </span>
                        )}
                    </div>

                    <h2 className="text-2xl font-serif font-bold text-primary mb-2 leading-snug">
                        {project.title}
                    </h2>
                    {project.subtitle && (
                        <p className="text-sm font-medium text-accent mb-3">{project.subtitle}</p>
                    )}

                    <ProjectMetaRow project={project} roleLabel={roleLabel} fundingLabel={fundingLabel} />

                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-500 leading-relaxed flex-1">
                        {project.summary}
                    </p>

                    {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                            {project.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs text-neutral-600 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-800/70 px-2 py-0.5 rounded border border-neutral-200/80 dark:border-slate-700/70"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <ProjectActions
                        project={project}
                        detailsLabel={detailsLabel}
                        onOpenDetails={onOpenDetails}
                    />
                </div>
            </div>
        </motion.article>
    );
}

export default function ProjectsPage({
    config,
    embedded = false,
}: {
    config: ProjectsPageConfig;
    embedded?: boolean;
}) {
    const messages = useMessages();
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

    const categoryTabs = useMemo(() => {
        const categories = config.categories || [];
        return categories.map((cat) => ({
            ...cat,
            count: config.items.filter((item) => item.category === cat.id).length,
        })).filter((cat) => cat.count > 0);
    }, [config.categories, config.items]);

    const filteredItems = useMemo(() => {
        if (activeCategory === 'all') return config.items;
        return config.items.filter((item) => item.category === activeCategory);
    }, [activeCategory, config.items]);

    const spotlightItem = useMemo(() => {
        if (embedded) return null;
        return filteredItems.find((item) => item.featured) || null;
    }, [embedded, filteredItems]);

    const gridItems = useMemo(() => {
        if (!spotlightItem) return filteredItems;
        return filteredItems.filter((item) => item.id !== spotlightItem.id);
    }, [filteredItems, spotlightItem]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <div className={embedded ? 'mb-6' : 'mb-8'}>
                <div className="flex flex-wrap items-baseline justify-between gap-4 mb-3">
                    <h1 className={`${embedded ? 'text-2xl' : 'text-4xl'} font-serif font-bold text-primary`}>
                        {config.title}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-500">
                        <FolderGit2 className="h-3.5 w-3.5 text-accent" />
                        {config.items.length} {messages.projects.summaryTotal}
                    </span>
                </div>
                {config.description && (
                    <p className={`${embedded ? 'text-base' : 'text-lg'} text-neutral-600 dark:text-neutral-500 max-w-3xl leading-relaxed`}>
                        {config.description}
                    </p>
                )}
            </div>

            {/* Category Filters */}
            {categoryTabs.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-8">
                    <button
                        type="button"
                        onClick={() => setActiveCategory('all')}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                            activeCategory === 'all'
                                ? 'bg-accent/15 text-accent border-accent/50 shadow-sm'
                                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:border-accent/40 hover:text-primary'
                        }`}
                    >
                        <span>{messages.common.all}</span>
                        <span className="text-xs opacity-75">({config.items.length})</span>
                    </button>
                    {categoryTabs.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setActiveCategory(cat.id)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                                activeCategory === cat.id
                                    ? 'bg-accent/15 text-accent border-accent/50 shadow-sm'
                                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:border-accent/40 hover:text-primary'
                            }`}
                        >
                            <span>{cat.label}</span>
                            <span className="text-xs opacity-75">({cat.count})</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Spotlight Card */}
            {spotlightItem && (
                <FeaturedSpotlightCard
                    project={spotlightItem}
                    featuredLabel={messages.projects.featuredBadge}
                    roleLabel={messages.projects.role}
                    fundingLabel={messages.projects.funding}
                    detailsLabel={messages.projects.viewDetails}
                    onOpenDetails={setSelectedProject}
                />
            )}

            {/* 2-Column Grid */}
            {gridItems.length > 0 ? (
                <div className={`grid grid-cols-1 ${embedded ? 'md:grid-cols-2 gap-4' : 'md:grid-cols-2 gap-6'}`}>
                    {gridItems.map((project, index) => (
                        <motion.article
                            key={project.id}
                            id={project.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: 0.06 * index }}
                            className={`scroll-mt-24 group flex flex-col rounded-xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-lg hover:border-accent/40 transition-all duration-200 ${
                                !project.image ? 'border-t-2 border-t-accent/70' : ''
                            }`}
                        >
                            {project.image && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedProject(project)}
                                    className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 text-left cursor-zoom-in"
                                    aria-label={project.title}
                                >
                                    <Image
                                        src={withBasePath(project.image)}
                                        alt={project.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, 420px"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70 group-hover:opacity-45 transition-opacity duration-300" />
                                    {(project.status || project.category_label) && (
                                        <span className="absolute top-3 right-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background/85 text-primary backdrop-blur-md border border-neutral-200/70 dark:border-slate-700/70 shadow-sm">
                                            {project.status || project.category_label}
                                        </span>
                                    )}
                                    <span className="absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/85 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm">
                                        <Maximize2 className="h-4 w-4" />
                                    </span>
                                </button>
                            )}

                            <div className="p-5 flex flex-col flex-1">
                                {!project.image && (project.category_label || project.status) && (
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        {project.category_label && (
                                            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                                                {project.category_label}
                                            </span>
                                        )}
                                        {project.status && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/25">
                                                {project.status}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <h3 className="text-lg font-serif font-semibold text-primary leading-snug mb-1.5 group-hover:text-accent transition-colors">
                                    {project.title}
                                </h3>
                                {project.subtitle && (
                                    <p className="text-sm font-medium text-accent mb-2.5">{project.subtitle}</p>
                                )}

                                <ProjectMetaRow
                                    project={project}
                                    roleLabel={messages.projects.role}
                                    fundingLabel={messages.projects.funding}
                                />

                                <p className="text-sm text-neutral-600 dark:text-neutral-500 leading-relaxed flex-1">
                                    {project.summary}
                                </p>

                                {project.tags && project.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-4">
                                        {project.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/60 px-2 py-0.5 rounded border border-neutral-100 dark:border-neutral-800"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <ProjectActions
                                    project={project}
                                    detailsLabel={messages.projects.viewDetails}
                                    onOpenDetails={setSelectedProject}
                                />
                            </div>
                        </motion.article>
                    ))}
                </div>
            ) : (
                !spotlightItem && (
                    <div className="text-center py-12 text-neutral-500">
                        {messages.projects.noProjects}
                    </div>
                )
            )}

            {/* Project Detail Lightbox / Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedProject(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6"
                        >
                            <button
                                type="button"
                                onClick={() => setSelectedProject(null)}
                                aria-label={messages.projects.close}
                                className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-slate-300 hover:text-primary transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            {selectedProject.image && (
                                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 mb-5">
                                    <Image
                                        src={withBasePath(selectedProject.image)}
                                        alt={selectedProject.title}
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 768px) 100vw, 640px"
                                    />
                                </div>
                            )}

                            {selectedProject.category_label && (
                                <span className="inline-block text-xs font-semibold uppercase tracking-wider text-accent mb-1.5">
                                    {selectedProject.category_label}
                                </span>
                            )}
                            <h3 className="text-2xl font-serif font-bold text-primary pr-8 mb-2">
                                {selectedProject.title}
                            </h3>
                            {selectedProject.subtitle && (
                                <p className="text-sm font-medium text-accent mb-3">{selectedProject.subtitle}</p>
                            )}

                            <ProjectMetaRow
                                project={selectedProject}
                                roleLabel={messages.projects.role}
                                fundingLabel={messages.projects.funding}
                            />

                            <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-500 leading-relaxed whitespace-pre-line">
                                {selectedProject.description || selectedProject.summary}
                            </p>

                            {selectedProject.tags && selectedProject.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-4">
                                    {selectedProject.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/70 px-2 py-0.5 rounded border border-neutral-100 dark:border-neutral-800"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {selectedProject.links && selectedProject.links.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                    {selectedProject.links.map((link) => (
                                        <a
                                            key={`${link.label}-${link.url}`}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-white hover:bg-accent-dark transition-colors"
                                        >
                                            <LinkIcon kind={link.kind} />
                                            <span>{link.label}</span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
