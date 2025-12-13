import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ThumbnailGallery } from '@/components/ui/ThumbnailGallery';
import { useStudents } from '@/contexts/StudentContext';
import { Student } from '@/types';
import { format } from 'date-fns';
import { 
  ChevronLeft, 
  Clock, 
  Laptop, 
  User, 
  Hash,
  GraduationCap,
  FileDown,
  AlertCircle,
  Loader2
} from 'lucide-react';

const RecordDetails = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const { getStudentByRecordId } = useStudents();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      if (recordId) {
        setLoading(true);
        const found = await getStudentByRecordId(recordId);
        setStudent(found || null);
        setLoading(false);
      }
    };
    fetchStudent();
  }, [recordId, getStudentByRecordId]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Loader2 className="h-12 w-12 mx-auto text-primary mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading record...</p>
        </div>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Record Not Found</h1>
          <p className="text-muted-foreground mb-6">The requested student record could not be found.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 md:py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Student Record</h1>
          <p className="text-muted-foreground">Record ID: {student.recordId}</p>
        </div>

        <div className="space-y-6 animate-fade-in">
          {/* Student Profile Card */}
          <div className="bg-card rounded-2xl shadow-card p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Photo */}
              <img
                src={student.studentPhoto}
                alt={student.StudentName}
                className="w-32 h-32 rounded-2xl object-cover shadow-lg"
              />
              
              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{student.studentName}</h2>
                  <StatusBadge status={student.status} />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{student.className}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Student ID: {student.studentId}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span>Record: {student.recordId}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Time Details */}
          <div className="bg-card rounded-2xl shadow-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Check-In/Out Times
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-success/10 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Check-In Time</p>
                <p className="font-semibold text-success">
                  {format(new Date(student.checkInTime), 'MMMM d, yyyy')}
                </p>
                <p className="text-sm text-success">
                  {format(new Date(student.checkInTime), 'h:mm a')}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${student.checkOutTime ? 'bg-muted' : 'bg-warning/10'}`}>
                <p className="text-sm text-muted-foreground mb-1">Check-Out Time</p>
                {student.checkOutTime ? (
                  <>
                    <p className="font-semibold">
                      {format(new Date(student.checkOutTime), 'MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(student.checkOutTime), 'h:mm a')}
                    </p>
                  </>
                ) : (
                  <p className="font-semibold text-warning">Not checked out yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Device Information */}
          <div className="bg-card rounded-2xl shadow-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Laptop className="h-5 w-5" />
              Device Information
            </h3>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="font-medium">{student.deviceDescription}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Device Photos ({student.devicePhotos.length})
              </p>
              <ThumbnailGallery images={student.devicePhotos} size="lg" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1" disabled>
              <FileDown className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
            <Button variant="hero" className="flex-1" onClick={() => navigate('/admin')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecordDetails;