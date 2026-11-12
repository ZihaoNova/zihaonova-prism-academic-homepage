'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    EnvelopeIcon,
    AcademicCapIcon,
    HeartIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import { MapPinIcon as MapPinSolidIcon, EnvelopeIcon as EnvelopeSolidIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Github, Linkedin, Pin } from 'lucide-react';
import type { SiteConfig } from '@/lib/config';
import { withBasePath } from '@/lib/sitePath.mjs';
import { useMessages } from '@/lib/i18n/useMessages';

// Custom ORCID icon component
const OrcidIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z" />
    </svg>
);

// Custom University / Institutional Profile icon (FontAwesome fa-university solid)
const UniversityIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 512 512"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M496 128v16a8 8 0 0 1-8 8h-24v12c0 6.627-5.373 12-12 12H60c-6.627 0-12-5.373-12-12v-12H24a8 8 0 0 1-8-8v-16a8 8 0 0 1 4.941-7.392l232-88a7.996 7.996 0 0 1 6.118 0l232 88A8 8 0 0 1 496 128zm-24 304H40c-13.255 0-24 10.745-24 24v16a8 8 0 0 0 8 8h464a8 8 0 0 0 8-8v-16c0-13.255-10.745-24-24-24zM96 192v192H64V192h32zm128 0v192h-32V192h32zm128 0v192h-32V192h32zm128 0v192h-32V192h32z" />
    </svg>
);

// Custom ResearchGate icon component
const ResearchGateIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M19.586 0c-.818 0-1.508.19-2.072.565-.563.377-.97.936-1.213 1.68a3.193 3.193 0 0 0-.112.437 7.065 7.065 0 0 0-1.035-.115c-1.092 0-2.072.24-2.943.722a5.706 5.706 0 0 0-2.128 2.016 5.64 5.64 0 0 0-.793 2.977c0 .92.17 1.768.513 2.544.343.776.837 1.433 1.482 1.97.646.538 1.42.94 2.32 1.208-.12.443-.18.892-.18 1.347 0 .807.18 1.517.54 2.13.36.613.88 1.09 1.56 1.43.68.34 1.49.51 2.43.51.98 0 1.83-.17 2.55-.51.72-.34 1.27-.817 1.65-1.43.38-.613.57-1.323.57-2.13 0-.613-.12-1.18-.36-1.7-.24-.52-.58-.96-1.02-1.32-.44-.36-.96-.64-1.56-.84.28-.48.42-1.02.42-1.62 0-.64-.15-1.22-.45-1.74a3.17 3.17 0 0 0-1.26-1.2c-.54-.32-1.19-.48-1.95-.48-.68 0-1.31.14-1.89.42-.58.28-1.04.68-1.38 1.2-.34.52-.51 1.13-.51 1.83 0 .76.18 1.42.54 1.98.36.56.88.99 1.56 1.29.68.3 1.49.45 2.43.45.68 0 1.32-.1 1.92-.3.6-.2 1.1-.48 1.5-.84.4-.36.68-.78.84-1.26h-4.26v-1.62h6.42c.08.32.12.66.12 1.02 0 1.04-.26 1.96-.78 2.76-.52.8-1.24 1.42-2.16 1.86-.92.44-1.98.66-3.18.66-1.32 0-2.48-.25-3.48-.75-1-.5-1.79-1.21-2.37-2.13-.58-.92-.87-2.02-.87-3.3 0-1.36.31-2.53.93-3.51.62-.98 1.49-1.73 2.61-2.25 1.12-.52 2.44-.78 3.96-.78.84 0 1.62.09 2.34.27.72.18 1.34.45 1.86.81v-1.56c0-.64-.17-1.12-.51-1.44-.34-.32-.87-.48-1.59-.48-.64 0-1.15.12-1.53.36-.38.24-.62.59-.72 1.05l-1.98-.3c.22-.84.69-1.49 1.41-1.95.72-.46 1.66-.69 2.82-.69 1.44 0 2.52.34 3.24 1.02.72.68 1.08 1.66 1.08 2.94v6.6h-1.8v-1.32c-.36.44-.82.8-1.38 1.08z" />
    </svg>
);

interface ProfileProps {
    author: SiteConfig['author'];
    social: SiteConfig['social'];
    features: SiteConfig['features'];
    researchInterests?: string[];
}

export default function Profile({ author, social, features, researchInterests }: ProfileProps) {
    const messages = useMessages();

    const [hasLiked, setHasLiked] = useState(false);
    const [showThanks, setShowThanks] = useState(false);
    const [showAddress, setShowAddress] = useState(false);
    const [isAddressPinned, setIsAddressPinned] = useState(false);
    const [showEmail, setShowEmail] = useState(false);
    const [isEmailPinned, setIsEmailPinned] = useState(false);
    const [lastClickedTooltip, setLastClickedTooltip] = useState<'email' | 'address' | null>(null);

    // Check local storage for user's like status
    useEffect(() => {
        if (!features.enable_likes) return;

        const userHasLiked = localStorage.getItem('zihao-prism-user-liked');
        if (userHasLiked === 'true') {
            setHasLiked(true);
        }
    }, [features.enable_likes]);

    const handleLike = () => {
        const newLikedState = !hasLiked;
        setHasLiked(newLikedState);

        if (newLikedState) {
            localStorage.setItem('zihao-prism-user-liked', 'true');
            setShowThanks(true);
            setTimeout(() => setShowThanks(false), 2000);
        } else {
            localStorage.removeItem('zihao-prism-user-liked');
            setShowThanks(false);
        }
    };

    const socialLinks = [
        ...(social.email ? [{
            name: messages.profile.email,
            href: `mailto:${social.email}`,
            icon: EnvelopeIcon,
            isEmail: true,
        }] : []),
        ...(social.location || social.location_details ? [{
            name: messages.profile.location,
            href: social.location_url || '#',
            icon: MapPinIcon,
            isLocation: true,
        }] : []),
        ...(social.institutional_profile ? [{
            name: messages.profile.institutionalProfile,
            href: social.institutional_profile as string,
            icon: UniversityIcon,
        }] : []),
        ...(social.google_scholar ? [{
            name: 'Google Scholar',
            href: social.google_scholar as string,
            icon: AcademicCapIcon,
        }] : []),
        ...(social.researchgate ? [{
            name: 'ResearchGate',
            href: social.researchgate as string,
            icon: ResearchGateIcon,
        }] : []),
        ...(social.orcid ? [{
            name: 'ORCID',
            href: social.orcid,
            icon: OrcidIcon,
        }] : []),
        ...(social.github ? [{
            name: 'GitHub',
            href: social.github,
            icon: Github,
        }] : []),
        ...(social.linkedin ? [{
            name: 'LinkedIn',
            href: social.linkedin,
            icon: Linkedin,
        }] : []),
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="sticky top-8"
        >
            {/* Profile Image */}
            <div className="w-64 h-64 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <Image
                    src={withBasePath(author.avatar)}
                    alt={author.name}
                    width={256}
                    height={256}
                    className="w-full h-full object-cover object-[32%_center]"
                    priority
                />
            </div>

            {/* Name and Title */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-serif font-bold text-primary mb-2">
                    {author.name}
                </h1>
                <p className="text-lg text-accent font-medium mb-1">
                    {author.title}
                </p>
                <p className="text-neutral-600 mb-2">
                    {author.institution}
                </p>
            </div>

            {/* Contact Links */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6 relative px-2">
                {socialLinks.map((link) => {
                    const IconComponent = link.icon;
                    if (link.isLocation) {
                        return (
                            <div key={link.name} className="relative">
                                <button
                                    onMouseEnter={() => {
                                        if (!isAddressPinned) setShowAddress(true);
                                        setLastClickedTooltip('address');
                                    }}
                                    onMouseLeave={() => !isAddressPinned && setShowAddress(false)}
                                    onClick={() => {
                                        setIsAddressPinned(!isAddressPinned);
                                        setShowAddress(!isAddressPinned);
                                        setLastClickedTooltip('address');
                                    }}
                                    className={`p-2 sm:p-2 transition-colors duration-200 ${isAddressPinned
                                        ? 'text-accent'
                                        : 'text-neutral-600 dark:text-neutral-400 hover:text-accent'
                                        }`}
                                    aria-label={link.name}
                            title={link.name}
                                >
                                    {isAddressPinned ? (
                                        <MapPinSolidIcon className="h-5 w-5" />
                                    ) : (
                                        <MapPinIcon className="h-5 w-5" />
                                    )}
                                </button>

                                {/* Address tooltip */}
                                <AnimatePresence>
                                    {(showAddress || isAddressPinned) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                            animate={{ opacity: 1, y: -10, scale: 1 }}
                                            exit={{ opacity: 0, y: -20, scale: 0.8 }}
                                            className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-neutral-800 text-white px-4 py-3 rounded-lg text-sm font-medium shadow-lg max-w-[calc(100vw-2rem)] sm:max-w-none sm:whitespace-nowrap ${lastClickedTooltip === 'address' ? 'z-20' : 'z-10'
                                                }`}
                                            onMouseEnter={() => {
                                                if (!isAddressPinned) setShowAddress(true);
                                                setLastClickedTooltip('address');
                                            }}
                                            onMouseLeave={() => !isAddressPinned && setShowAddress(false)}
                                        >
                                            <div className="text-center">
                                                <div className="flex items-center justify-center space-x-2 mb-1">
                                                    <p className="font-semibold">{messages.profile.workAddress}</p>
                                                    {!isAddressPinned && (
                                                        <div className="flex items-center space-x-0.5 text-xs text-neutral-400 opacity-60">
                                                            <Pin className="h-2.5 w-2.5" />
                                                            <span className="hidden sm:inline">{messages.profile.click}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {social.location_details?.map((line, i) => (
                                                    <p key={i} className="break-words">{line}</p>
                                                ))}
                                                <div className="mt-2 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-center">
                                                    {social.location_url && (
                                                        <a
                                                            href={social.location_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center justify-center space-x-2 bg-accent hover:bg-accent-dark text-white px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 w-full sm:w-auto"
                                                        >
                                                            <MapPinIcon className="h-4 w-4" />
                                                            <span>{messages.profile.googleMap}</span>
                                                        </a>
                                                    )}
                                                </div>

                                            </div>
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-800"></div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    }
                    if (link.isEmail) {
                        return (
                            <div key={link.name} className="relative">
                                <button
                                    onMouseEnter={() => {
                                        if (!isEmailPinned) setShowEmail(true);
                                        setLastClickedTooltip('email');
                                    }}
                                    onMouseLeave={() => !isEmailPinned && setShowEmail(false)}
                                    onClick={() => {
                                        setIsEmailPinned(!isEmailPinned);
                                        setShowEmail(!isEmailPinned);
                                        setLastClickedTooltip('email');
                                    }}
                                    className={`p-2 sm:p-2 transition-colors duration-200 ${isEmailPinned
                                        ? 'text-accent'
                                        : 'text-neutral-600 dark:text-neutral-400 hover:text-accent'
                                        }`}
                                    aria-label={link.name}
                            title={link.name}
                                >
                                    {isEmailPinned ? (
                                        <EnvelopeSolidIcon className="h-5 w-5" />
                                    ) : (
                                        <EnvelopeIcon className="h-5 w-5" />
                                    )}
                                </button>

                                {/* Email tooltip */}
                                <AnimatePresence>
                                    {(showEmail || isEmailPinned) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                            animate={{ opacity: 1, y: -10, scale: 1 }}
                                            exit={{ opacity: 0, y: -20, scale: 0.8 }}
                                            className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-neutral-800 text-white px-4 py-3 rounded-lg text-sm font-medium shadow-lg max-w-[calc(100vw-2rem)] sm:max-w-none sm:whitespace-nowrap ${lastClickedTooltip === 'email' ? 'z-20' : 'z-10'
                                                }`}
                                            onMouseEnter={() => {
                                                if (!isEmailPinned) setShowEmail(true);
                                                setLastClickedTooltip('email');
                                            }}
                                            onMouseLeave={() => !isEmailPinned && setShowEmail(false)}
                                        >
                                            <div className="text-center">
                                                <div className="flex items-center justify-center space-x-2 mb-1">
                                                    <p className="font-semibold">{messages.profile.email}</p>
                                                    {!isEmailPinned && (
                                                        <div className="flex items-center space-x-0.5 text-xs text-neutral-400 opacity-60">
                                                            <Pin className="h-2.5 w-2.5" />
                                                            <span className="hidden sm:inline">{messages.profile.click}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="break-words">{social.email?.replace('@', ' (at) ')}</p>
                                                <div className="mt-2">
                                                    <a
                                                        href={link.href}
                                                        className="inline-flex items-center justify-center space-x-2 bg-accent hover:bg-accent-dark text-white px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 w-full sm:w-auto"
                                                    >
                                                        <EnvelopeIcon className="h-4 w-4" />
                                                        <span className="sm:hidden">{messages.profile.send}</span>
                                                        <span className="hidden sm:inline">{messages.profile.sendEmail}</span>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-800"></div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    }
                    return (
                        <a
                            key={link.name}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 sm:p-2 text-neutral-600 dark:text-neutral-400 hover:text-accent transition-colors duration-200"
                            aria-label={link.name}
                            title={link.name}
                        >
                            <IconComponent className="h-5 w-5" />
                        </a>
                    );
                })}
            </div>

            {/* Research Interests */}
            {researchInterests && researchInterests.length > 0 && (
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 mb-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                    <h3 className="font-semibold text-primary mb-3">{messages.profile.researchInterests}</h3>
                    <div className="space-y-2 text-sm text-neutral-700 dark:text-neutral-500">
                        {researchInterests.map((interest, index) => (
                            <div key={index}>{interest}</div>
                        ))}
                    </div>
                </div>
            )}

            {/* Like Button */}
            {features.enable_likes && (
                <div className="flex justify-center">
                    <div className="relative">
                        <motion.button
                            onClick={handleLike}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${hasLiked
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 cursor-pointer'
                                }`}
                        >
                            {hasLiked ? (
                                <HeartSolidIcon className="h-4 w-4" />
                            ) : (
                                <HeartIcon className="h-4 w-4" />
                            )}
                            <span>{hasLiked ? messages.profile.liked : messages.profile.like}</span>
                        </motion.button>

                        {/* Thanks bubble */}
                        <AnimatePresence>
                            {showThanks && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                    animate={{ opacity: 1, y: -10, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                                    className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap"
                                >
                                    {messages.profile.thanks} 😊
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-accent"></div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
