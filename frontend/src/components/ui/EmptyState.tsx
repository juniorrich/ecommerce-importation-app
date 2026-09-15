import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <Icon className="h-10 w-10 text-sand-500" strokeWidth={1.25} />
      <div>
        <h3 className="font-display text-xl text-ivory-200">{title}</h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-sand-400">
          {description}
        </p>
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-2 rounded bg-gold-500 px-5 py-2.5 text-sm font-medium text-espresso-950 transition-colors hover:bg-gold-400"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
