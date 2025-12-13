import { Link } from 'react-router-dom';
import { Student } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ThumbnailGallery } from '@/components/ui/ThumbnailGallery';
import { Clock, Laptop, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface StudentCardProps {
  student: Student;
  showDetails?: boolean;
  linkTo?: string;
}

export function StudentCard({ student, showDetails = true, linkTo }: StudentCardProps) {
  const content = (
    <div className="flex items-start gap-4 p-4 bg-card rounded-2xl shadow-card border border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-lg group">
      {/* Student Photo */}
      <div className="flex-shrink-0">
        <img
          src={student.studentPhoto}
          alt={student.studentName}
          className="w-16 h-16 rounded-xl object-cover shadow-sm"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {student.studentName}
            </h3>
            <p className="text-sm text-muted-foreground">{student.className}</p>
          </div>
          <StatusBadge status={student.status} />
        </div>

        {showDetails && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>In: {format(new Date(student.checkInTime), 'MMM d, h:mm a')}</span>
              {student.checkOutTime && (
                <span className="ml-2">Out: {format(new Date(student.checkOutTime), 'h:mm a')}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Laptop className="h-3 w-3" />
              <span className="truncate">{student.deviceDescription}</span>
            </div>
            {student.devicePhotos.length > 0 && (
              <ThumbnailGallery images={student.devicePhotos} size="sm" />
            )}
          </div>
        )}
      </div>

      {linkTo && (
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
      )}
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }

  return content;
}
