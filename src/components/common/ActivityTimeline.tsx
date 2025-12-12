/**
 * HealthWallet Nigeria - Activity Timeline Component
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import { FileText, DollarSign, Users, Vote, Shield, ExternalLink } from 'lucide-react';
import type { ActivityItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface ActivityTimelineProps {
  activities: ActivityItem[];
  title?: string;
  className?: string;
}

const activityIcons: Record<ActivityItem['type'], React.ElementType> = {
  record: FileText,
  claim: DollarSign,
  contribution: Users,
  vote: Vote,
  verification: Shield,
};

const activityColors: Record<ActivityItem['type'], string> = {
  record: 'bg-primary/10 text-primary',
  claim: 'bg-accent/10 text-accent',
  contribution: 'bg-success/10 text-success',
  vote: 'bg-secondary/10 text-secondary',
  verification: 'bg-info/10 text-info',
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  title = 'Recent Activity',
  className,
}) => {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
          
          <div className="space-y-6">
            {activities.map((activity, index) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];
              
              return (
                <div key={activity.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div className={cn(
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-background',
                    colorClass
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {activity.title}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                          {activity.description}
                        </p>
                      </div>
                      {activity.status && (
                        <StatusBadge 
                          status={activity.status} 
                          showIcon={false}
                          className="flex-shrink-0"
                        />
                      )}
                    </div>
                    
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                      {activity.txHash && (
                        <a
                          href={`https://polygonscan.com/tx/${activity.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          View TX
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {activities.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No recent activity
          </p>
        )}
      </CardContent>
    </Card>
  );
};
