import { formatCurrency } from '@/lib/currency';
import { clampPercent } from '@/lib/utils';

export default function ProgressBar({
  raised,
  goal,
  showAmounts = true,
}: {
  raised: number;
  goal: number;
  showAmounts?: boolean;
}) {
  const pct = clampPercent(raised, goal);
  return (
    <div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-burgundy/10">
        <div className="h-full rounded-full bg-gold-gradient transition-all" style={{ width: `${pct}%` }} />
      </div>
      {showAmounts && (
        <p className="mt-1 font-sans text-xs text-charcoal/60">
          {formatCurrency(raised)} / {formatCurrency(goal)} · {pct}%
        </p>
      )}
    </div>
  );
}
