import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { QRScanner } from '@/components/camera/QRScanner';
import { ThumbnailGallery } from '@/components/ui/ThumbnailGallery';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useStudents } from '@/contexts/StudentContext';
import { Student } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  ChevronLeft, 
  QrCode, 
  Check, 
  X, 
  Clock, 
  Laptop,
  User,
  AlertCircle,
  Loader2
} from 'lucide-react';

const CheckOut = () => {
  const navigate = useNavigate();
  const { getStudentByStudentId, checkOutStudent } = useStudents();
  
  const [showScanner, setShowScanner] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkOutComplete, setCheckOutComplete] = useState(false);

  const handleQRScan = async (studentId: string) => {
    const foundStudent = await getStudentByStudentId(studentId);
    if (foundStudent) {
      setStudent(foundStudent);
      setShowScanner(false);
    } else {
      toast.error(`No student found with ID: ${studentId}`);
    }
  };

  const handleCheckOut = async () => {
    if (!student) return;
    
    setIsProcessing(true);
    
    try {
      const success = await checkOutStudent(student.studentId);
      if (success) {
        toast.success('Check-out successful!');
        setCheckOutComplete(true);
      } else {
        toast.error('Student is already checked out');
      }
    } catch (error) {
      toast.error('Failed to complete check-out');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScan = () => {
    setStudent(null);
    setShowScanner(true);
    setCheckOutComplete(false);
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
          <h1 className="text-2xl font-bold">Student Check-Out</h1>
          <p className="text-muted-foreground">Scan QR code to verify and check out student</p>
        </div>

        <div className="animate-fade-in">
          {/* QR Scanner */}
          {showScanner && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-8 w-8 text-primary-foreground" />
                </div>
                <h2 className="text-lg font-semibold mb-2">Scan Student QR Code</h2>
                <p className="text-sm text-muted-foreground">
                  Position the QR code within the frame to identify the student
                </p>
              </div>
              
              <QRScanner onScan={handleQRScan} />
            </div>
          )}

          {/* Student Record Display */}
          {student && !showScanner && !checkOutComplete && (
            <div className="space-y-6">
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

                {/* Check-in Details */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Checked In:</span>
                    <span className="font-medium">
                      {format(new Date(student.checkInTime), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Laptop className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Device:</span>
                    <span className="font-medium">{student.deviceDescription}</span>
                  </div>
                </div>
              </div>

              {/* Device Photos */}
              <div className="bg-card rounded-2xl shadow-card p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Laptop className="h-5 w-5" />
                  Device Photos ({student.devicePhotos.length})
                </h3>
                <ThumbnailGallery images={student.devicePhotos} size="lg" />
                <p className="text-sm text-muted-foreground mt-4">
                  Verify that the student's device matches these photos before confirming check-out.
                </p>
              </div>

              {/* Already Checked Out Warning */}
              {student.status === 'checked-out' && (
                <div className="bg-warning/10 border border-warning/30 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-warning">Already Checked Out</p>
                    <p className="text-sm text-muted-foreground">
                      This student was checked out at {format(new Date(student.checkOutTime!), 'h:mm a')}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={resetScan}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  variant="hero" 
                  className="flex-1"
                  onClick={handleCheckOut}
                  disabled={student.status === 'checked-out' || isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Confirm Check-Out
                </Button>
              </div>
            </div>
          )}

          {/* Check-Out Complete */}
          {checkOutComplete && (
            <div className="text-center py-8 animate-scale-in">
              <div className="w-20 h-20 rounded-full gradient-success flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-success-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Check-Out Complete!</h2>
              <p className="text-muted-foreground mb-8">
                {student?.name} has been successfully checked out
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="hero" onClick={resetScan}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan Next Student
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Back to Home
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CheckOut;
