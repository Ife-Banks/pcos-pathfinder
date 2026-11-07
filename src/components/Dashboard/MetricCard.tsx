import { LucideIcon } from 'lucide-react';
import { getSeverityClasses, getSeverityLabel } from '@/utils/dashboardHelpers';

interface MetricCardProps {
  icon: LucideIcon;
  value: string | number | null;
  label: string;
  severity?: string | null;
  onClick?: () => void;
  loading?: boolean;
  bgColor?: string;
  iconColor?: string;
  textColor?: string;
}

export function MetricCard({
  icon: Icon,
  value,
  label,
  severity,
  onClick,
  loading = false,
  bgColor,
  iconColor,
  textColor,
}: MetricCardProps) {
  const severityClasses = severity ? getSeverityClasses(severity as any) : null;
  const finalBg = bgColor || severityClasses?.bg || 'bg-gray-50';
  const finalIconColor = iconColor || severityClasses?.icon || 'text-gray-400';
  const finalTextColor = textColor || severityClasses?.text || 'text-gray-500';

  if (loading) {
    return (
      <div className={`${finalBg} p-4 rounded-xl animate-pulse`}>
        <div className="h-4 w-4 bg-gray-300 rounded mx-auto mb-2" />
        <div className="h-6 w-12 bg-gray-300 rounded mx-auto mb-1" />
        <div className="h-3 w-16 bg-gray-300 rounded mx-auto mb-2" />
        <div className="h-3 w-20 bg-gray-300 rounded mx-auto" />
      </div>
    );
  }

  const displayValue = value !== null && value !== undefined ? String(value) : '—';

  return (
    <button
      onClick={onClick}
      className={`${finalBg} p-3 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
      disabled={!onClick}
    >
      <Icon className={`h-4 w-4 mx-auto mb-1.5 ${finalIconColor}`} />
      <p className="text-xl font-bold font-display text-gray-900 mb-1">
        {displayValue}
      </p>
      {severity ? (
        <p className={`text-[10px] font-medium mb-1.5 ${finalTextColor} truncate`}>
          {getSeverityLabel(severity as any)}
        </p>
      ) : (
        <p className="text-[10px] text-gray-400 mb-1.5">—</p>
      )}
      <p className="text-[9px] text-gray-600 font-medium line-clamp-2 leading-tight">{label}</p>
    </button>
  );
}
