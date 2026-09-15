import React from 'react';
import { cn } from '@/lib/utils';

type Tone = 'gold' | 'harbor' | 'neutral' | 'danger';

const toneClasses: Record<Tone, string> = {
  gold: 'text-gold-400 border-gold-600/50',
  harbor: 'text-harbor-400 border-harbor-500/50',
  neutral: 'text-sand-400 border-espresso-600',
  danger: 'text-red-400 border-red-900',
};

export default function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 text-xs',
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
