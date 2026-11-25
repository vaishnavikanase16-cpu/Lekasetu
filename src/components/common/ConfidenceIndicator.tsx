import React from 'react';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { ConfidenceBand } from '../../types';

export function getConfidenceBand(score: number): ConfidenceBand {
  if (score >= 85) return 'High';
  if (score >= 65) return 'Medium';
  return 'Low';
}

interface ConfidenceIndicatorProps {
  score: number;
  showBar?: boolean;
  compact?: boolean;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  score,
  showBar = false,
  compact = false,
}) => {
  const band = getConfidenceBand(score);

  const styles =
    band === 'High'
      ? {
          text: 'text-emerald-700 dark:text-emerald-400',
          bar: 'bg-emerald-600 dark:bg-emerald-500',
          icon: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />,
          label: 'High',
        }
      : band === 'Medium'
        ? {
            text: 'text-amber-700 dark:text-amber-400',
            bar: 'bg-amber-500 dark:bg-amber-400',
            icon: <AlertTriangle className="w-3.5 h-3.5 shrink-0" />,
            label: 'Medium',
          }
        : {
            text: 'text-red-700 dark:text-red-400',
            bar: 'bg-red-600 dark:bg-red-500',
            icon: <AlertCircle className="w-3.5 h-3.5 shrink-0" />,
            label: 'Low',
          };

  return (
    <div className="inline-flex flex-col gap-1">
      <span
        className={`inline-flex items-center gap-1.5 font-mono tabular-nums text-xs font-medium ${styles.text}`}
      >
        {styles.icon}
        <span>{score}%</span>
        {!compact && <span className="font-sans font-medium">· {styles.label}</span>}
      </span>
      {showBar && (
        <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-sm overflow-hidden">
          <div
            className={`h-full ${styles.bar} transition-all duration-300`}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
      )}
    </div>
  );
};
