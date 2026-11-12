'use client';

interface PublicationMetricBadgesProps {
  impactFactor?: string | number;
  quartile?: string;
}

/**
 * Renders Impact Factor and Quartile badges using explicit slate/emerald tokens
 * so dark mode remains high-contrast despite inverted `--neutral-*` CSS vars.
 */
export default function PublicationMetricBadges({
  impactFactor,
  quartile,
}: PublicationMetricBadgesProps) {
  if (!impactFactor && !quartile) {
    return null;
  }

  return (
    <>
      {impactFactor && (
        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-300/70 dark:border-slate-700">
          IF {impactFactor}
        </span>
      )}
      {quartile && (
        <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60">
          {quartile}
        </span>
      )}
    </>
  );
}
