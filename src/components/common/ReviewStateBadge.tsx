import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { FieldReviewState } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface ReviewStateBadgeProps {
  state: FieldReviewState;
  modelConfidence?: number;
}

export const ReviewStateBadge: React.FC<ReviewStateBadgeProps> = ({
  state,
  modelConfidence,
}) => {
  const { t } = useLanguage();

  if (state === 'HighConfidence') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>
          {t('review.HighConfidence')}
          {typeof modelConfidence === 'number' ? ` (${modelConfidence}%)` : ''}
        </span>
      </span>
    );
  }

  if (state === 'NeedsHumanReview') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>
          {t('review.NeedsHumanReview')}
          {typeof modelConfidence === 'number' ? ` (${modelConfidence}%)` : ''}
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{t('review.MissingOrInvalid')}</span>
    </span>
  );
};
