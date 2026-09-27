import { BadgeCheck, Hourglass } from 'lucide-react';
import { t } from '../../i18n';

// District verification status: green when field-verified, subtle otherwise
export default function VerifiedBadge({ verified, size = 'sm', className = '' }) {
  if (verified) {
    return (
      <span className={`badge badge-success gap-1 badge-${size} ${className}`}>
        <BadgeCheck className="w-3 h-3" /> {t('district.verified')}
      </span>
    );
  }
  return (
    <span className={`badge badge-ghost gap-1 badge-${size} opacity-80 ${className}`}>
      <Hourglass className="w-3 h-3" /> {t('district.notVerified')}
    </span>
  );
}
