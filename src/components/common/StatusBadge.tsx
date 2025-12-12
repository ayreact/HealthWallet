/**
 * HealthWallet Nigeria - Status Badge Component
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check, X, Clock, AlertTriangle } from 'lucide-react';

type StatusType = 'success' | 'pending' | 'failed' | 'warning' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  text?: string;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<StatusType, {
  label: string;
  icon: React.ElementType;
  className: string;
}> = {
  success: {
    label: 'Verified',
    icon: Check,
    className: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
  },
  failed: {
    label: 'Failed',
    icon: X,
    className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
  },
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    className: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
  },
  info: {
    label: 'Info',
    icon: Clock,
    className: 'bg-info/10 text-info border-info/20 hover:bg-info/20',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  showIcon = true,
  className,
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 font-medium transition-colors',
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {text || config.label}
    </Badge>
  );
};
