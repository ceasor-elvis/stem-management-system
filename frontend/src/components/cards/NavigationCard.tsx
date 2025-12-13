import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationCardProps {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'success';
  delay?: number;
}

export function NavigationCard({ 
  to, 
  icon: Icon, 
  title, 
  description,
  variant = 'primary',
  delay = 0
}: NavigationCardProps) {
  const variantStyles = {
    primary: 'border-primary/20 hover:border-primary/40 hover:bg-primary/5',
    secondary: 'border-secondary hover:border-primary/30 hover:bg-secondary/80',
    accent: 'border-accent/20 hover:border-accent/40 hover:bg-accent/5',
    success: 'border-success/20 hover:border-success/40 hover:bg-success/5'
  };

  const iconStyles = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary text-secondary-foreground',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success'
  };

  return (
    <Link
      to={to}
      className={cn(
        'group block p-6 rounded-2xl border-2 bg-card shadow-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-slide-up',
        variantStyles[variant]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn(
        'w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110',
        iconStyles[variant]
      )}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    </Link>
  );
}
