import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'checked-in' | 'checked-out';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        status === 'checked-in' 
          ? 'bg-success/10 text-success' 
          : 'bg-muted text-muted-foreground',
        className
      )}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full mr-2',
        status === 'checked-in' ? 'bg-success' : 'bg-muted-foreground'
      )} />
      {status === 'checked-in' ? 'Checked In' : 'Checked Out'}
    </span>
  );
}
