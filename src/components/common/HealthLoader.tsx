/**
 * HealthWallet Nigeria - Custom Loading Spinner
 * Spinning Stethoscope as per TRD
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Heart, Loader2 } from 'lucide-react';

interface HealthLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const HealthLoader: React.FC<HealthLoaderProps> = ({
  size = 'md',
  text,
  className,
}) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className="relative">
        <div className={cn('animate-spin-slow', sizes[size])}>
          <Loader2 className={cn('text-primary', sizes[size])} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart className={cn('text-primary animate-pulse', {
            'h-3 w-3': size === 'sm',
            'h-4 w-4': size === 'md',
            'h-6 w-6': size === 'lg',
          })} />
        </div>
      </div>
      {text && (
        <p className={cn('text-muted-foreground animate-pulse', textSizes[size])}>
          {text}
        </p>
      )}
    </div>
  );
};

// Full page loader
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <HealthLoader size="lg" text={text} />
    </div>
  );
};

// Inline loader for cards/sections
export const InlineLoader: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="flex items-center justify-center py-12">
      <HealthLoader size="md" text={text} />
    </div>
  );
};
