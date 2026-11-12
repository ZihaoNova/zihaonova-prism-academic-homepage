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

// Custom ResearchGate icon component (Academicons official)
const ResearchGateIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 384 512"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M 228.65968,408.10149 C 208.46616,386.12784 181.4422,350.83324 158.962,310.93516 c 37.13444,-8.68487 64.63318,-43.55027 64.63318,-78.38386 0,-51.3457 -39.88089,-75.17678 -92.16329,-75.17678 -27.02266,0 -48.583367,1.36546 -68.715441,1.36546 -18.369155,0 -36.722401,0 -48.154153,-0.4447 v 13.30466 l 17.401097,3.19159 c 11.968845,2.30214 18.78249,7.76579 18.78249,36.21494 v 180.59919 c 0,28.43543 -6.813222,33.92871 -18.78249,36.19953 l -17.401097,3.25258 v 13.25908 c 12.367998,-0.4447 33.912828,-1.3513 55.473533,-1.3513 20.62404,0 47.217451,0.9066 58.680561,1.3513 v -13.25908 l -23.84698,-3.25258 c -12.366696,-1.796 -18.813848,-7.7641 -18.813848,-36.19953 v -76.54225 c 11.002507,0.92078 20.624038,0.92078 35.325548,0.92078 27.95932,49.94887 54.55102,87.55896 69.65214,104.9618 13.779,16.52587 34.84949,27.05401 61.44162,27.05401 7.78128,0 16.02316,-1.36721 21.05458,-3.68315 v -11.89361 c -16.49625,0 -32.99204,-11.47725 -44.8702,-24.3213 z M 119.06392,295.34424 c -15.59093,0 -22.434257,-0.41463 -33.007939,-1.41103 V 178.91935 c 10.573682,-0.92079 24.751869,-0.92079 37.135739,-0.92079 38.53132,0 61.42745,20.19525 61.42745,56.83902 0,36.21495 -24.73641,60.50666 -65.55525,60.50666 z m 139.93416,-115.7035 c -0.4606,-2.4087 -0.87524,-5.21701 -1.24303,-8.45544 -0.38328,-3.26846 -0.63033,-7.10411 -0.78243,-11.63108 -0.15386,-4.49562 -0.21509,-9.98891 -0.21509,-16.28098 0,-6.32297 0.0616,-11.7398 0.21509,-16.25087 0.15258,-4.52698 0.39915,-8.4099 0.78243,-11.64703 0.36778,-3.22291 0.78243,-6.0467 1.24303,-8.45541 0.4447,-2.4246 1.02776,-4.72679 1.78055,-6.981678 3.94262,-11.923264 10.40396,-20.884861 19.44246,-26.901503 9.0226,-6.015342 20.08653,-9.036752 33.22147,-9.036752 6.75224,0 12.87587,0.782429 18.30773,2.377345 5.37082,1.580761 10.1887,3.760457 14.43897,6.552435 4.18926,2.762339 7.81137,6.015349 10.80317,9.698476 3.06868,3.697285 5.53882,7.641624 7.47319,11.877718 0.75106,1.349583 0.53752,2.424608 -0.65998,3.175676 l -16.68012,6.858773 c -1.41275,0.75278 -2.40869,0.36907 -3.19287,-1.12058 -3.74283,-6.93613 -6.93611,-11.49275 -12.18281,-14.806757 -5.30941,-3.299853 -10.22007,-4.865129 -18.3077,-4.865129 -8.79314,0 -12.7216,1.748734 -18.22953,5.693102 -5.46364,3.867008 -9.46901,8.732137 -11.83217,16.142614 -0.47437,1.33581 -0.9053,2.99348 -1.41104,4.94203 -0.41463,1.97991 -0.75278,4.40452 -0.9663,7.24247 -0.21544,2.83925 -0.41464,6.35308 -0.59855,10.49678 -0.12246,4.14373 -0.18403,9.17686 -0.18403,15.00788 0,5.86107 0.0616,10.8942 0.18403,15.03794 0.18402,4.12779 0.38328,7.64162 0.59855,10.48086 0.2135,2.86931 0.55167,5.27805 0.9663,7.27386 0.50616,1.91846 0.93667,3.57483 1.41104,4.92613 2.36316,7.38084 5.74037,11.41585 10.71205,14.65467 4.91068,3.28394 10.55651,5.64755 19.34965,5.64755 7.81134,0 14.96232,-2.22524 19.62634,-5.61746 4.61979,-3.39094 8.45544,-7.87108 10.17452,-13.99472 0.75281,-2.57843 1.71916,-5.78588 2.3791,-9.71393 0.59853,-3.92843 0.59853,-8.08632 0.59853,-13.82497 0,-0.9066 -0.5074,-1.36721 -1.3513,-1.36721 h -26.71631 c -1.50383,0 -2.24073,-0.73558 -2.24073,-2.23898 v -15.31466 c 0,-1.51931 0.7369,-2.25661 2.24073,-2.25661 h 49.02807 c 1.53521,0 2.25661,0.73688 2.25661,2.25661 v 13.08938 c 0,6.93614 0,13.36612 -0.7214,19.32001 -0.69131,5.95392 -1.62625,11.10951 -2.80789,14.86822 -3.74453,11.7712 -9.68254,20.14969 -18.78247,26.39405 -9.1313,6.29165 -20.90079,9.68257 -33.6838,9.68257 -13.13494,0 -24.19891,-3.02183 -33.22147,-9.0226 -9.0385,-6.07635 -15.49984,-14.99239 -19.44246,-26.91566 -0.75279,-2.25489 -1.33585,-4.57253 -1.78055,-6.99714 z" />
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
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 mb-6 relative px-1">
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
                                    className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-200 ${isAddressPinned
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
                                    className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-200 ${isEmailPinned
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
                            className="p-1.5 sm:p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-accent transition-colors duration-200"
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
