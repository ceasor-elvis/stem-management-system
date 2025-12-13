import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { QRScanner } from '@/components/camera/QRScanner';
import { ThumbnailGallery } from '@/components/ui/ThumbnailGallery';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/contexts/StudentContext';
import { Student } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  Shield, 
  ChevronLeft, 
  QrCode, 
  Clock, 
  Laptop,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

const Security = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getStudentByStudentId } = useStudents();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [showScanner, setShowScanner] = useState(true);

  // Redirect if not authenticated or not security/admin
  if (!isAuthenticated || !user || !['admin', 'security'].includes(user.role)) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in as Security or Admin to access this portal.</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </Layout>
    );
  }

  const handleQRScan = async (studentId: string) => {
    const foundStudent = await getStudentByStudentId(studentId);
    if (foundStudent) {
      setStudent(foundStudent);
      setShowScanner(false);
    } else {
      toast.error(`No student found with ID: ${studentId}`);
    }
  };

  const resetScan = () => {
    setStudent(null);
    setShowScanner(true);
  };

  return (
    <Layout>
      <div className="container py-6 md:py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Security Portal</h1>
              <p className="text-muted-foreground">Verify students at exit points</p>
            </div>
          </div>
        </div>

        <div className="animate-fade-in">
          {/* QR Scanner */}
          {showScanner && (
            <div className="space-y-6">
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-primary">Security Verification</p>
                  <p className="text-sm text-muted-foreground">
                    Scan the student's QR code to verify their identity and device before allowing exit.
                  </p>
                </div>
              </div>
              
              <QRScanner onScan={handleQRScan} />
            </div>
          )}

          {/* Student Verification Display */}
          {student && !showScanner && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className={`rounded-2xl p-4 flex items-center gap-3 ${
                student.status === 'checked-in' 
                  ? 'bg-success/10 border border-success/30' 
                  : 'bg-muted border border-border'
              }`}>
                {student.status === 'checked-in' ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-success" />
                    <div>
                      <p className="font-semibold text-success">Student Verified</p>
                      <p className="text-sm text-muted-foreground">Student is currently checked in and can be verified for exit</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Already Checked Out</p>
                      <p className="text-sm text-muted-foreground">This student has already left the facility</p>
                    </div>
                  </>
                )}
              </div>

              {/* Student Info Card */}
              <div className="bg-card rounded-2xl shadow-card p-6">
                <div className="flex items-start gap-4 mb-6">
                  <img
                    src={student.studentPhoto}
                    alt={student.studentName}
                    className="w-24 h-24 rounded-2xl object-cover shadow-md"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold">{student.studentName}</h2>
                        <p className="text-muted-foreground">{student.className}</p>
                        <p className="text-sm text-muted-foreground mt-1">ID: {student.studentId}</p>
                      </div>
                      <StatusBadge status={student.status} />
                    </div>
                  </div>
                </div>

                {/* Timing Info */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Checked In:</span>
                    <span className="font-medium">
                      {format(new Date(student.checkInTime), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  {student.checkOutTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Checked Out:</span>
                      <span className="font-medium">
                        {format(new Date(student.checkOutTime), 'h:mm a')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Device Verification */}
              <div className="bg-card rounded-2xl shadow-card p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Laptop className="h-5 w-5" />
                  Device to Verify
                </h3>
                <div className="mb-4 p-3 bg-warning/10 rounded-xl">
                  <p className="font-medium">{student.deviceDescription}</p>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Reference Photos ({student.devicePhotos.length})
                </p>
                <ThumbnailGallery images={student.devicePhotos} size="lg" />
                <p className="text-sm text-muted-foreground mt-4 p-3 bg-muted rounded-xl">
                  <strong>Verify:</strong> Ensure the student's device matches these reference photos before allowing exit.
                </p>
              </div>

              {/* Scan Again Button */}
              <Button variant="hero" className="w-full" onClick={resetScan}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Scan Next Student
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Security;
