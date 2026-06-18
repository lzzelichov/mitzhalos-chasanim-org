'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { burst } from '@/lib/confetti';
import { formatMoney } from '@/lib/utils';

const MILESTONES = [25, 50, 75, 100];

export default function ProgressBar({
  raised,
  goal,
  percent,
}: {
  raised: number;
  goal: number;
  percent: number;
}) {
  const t = useTranslations('Progress');

  useEffect(() => {
    const hit = MILESTONES.filter((m) => percent >= m);
    if (hit.length > 0) {
      const timer = setTimeout(() => void burst(), 600);
      return () => clearTimeout(timer);
    }
  }, [percent]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-display text-2xl font-bold text-burgundy">
          {percent >= 100 ? t('goalReached') : t('funded', { percent })}
        </span>
        <span className="font-sans text-sm font-medium text-charcoal/70">
          {t('raisedOf', { raised: formatMoney(raised), goal: formatMoney(goal) })}
        </span>
      </div>

      <div className="relative h-4 w-full overflow-hidden rounded-full border border-gold/40 bg-burgundy/5">
        {MILESTONES.slice(0, 3).map((m) => (
          <div
            key={m}
            className="absolute top-0 z-10 h-full w-px bg-burgundy/20"
            style={{ insetInlineStart: `${m}%` }}
            aria-hidden
          />
        ))}
        <motion.div
          className="h-full rounded-full bg-gold-gradient shadow-glow"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
