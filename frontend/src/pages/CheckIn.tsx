import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CameraCapture } from '@/components/camera/CameraCapture';
import { QRScanner } from '@/components/camera/QRScanner';
import { ThumbnailGallery } from '@/components/ui/ThumbnailGallery';
import { useStudents } from '@/contexts/StudentContext';
import { toast } from 'sonner';
import { 
  Camera, 
  Laptop, 
  QrCode, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Plus,
  Loader2
} from 'lucide-react';

type Step = 'student-photo' | 'device-photos' | 'form' | 'qr-scan' | 'complete';

const CheckIn = () => {
  const navigate = useNavigate();
  const { addStudent } = useStudents();
  
  const [currentStep, setCurrentStep] = useState<Step>('student-photo');
  const [studentPhoto, setStudentPhoto] = useState<string>('');
  const [devicePhotos, setDevicePhotos] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    studentName: '',
    className: '',
    studentId: '',
    deviceDescription: ''
  });

  const steps: { id: Step; title: string; icon: React.ReactNode }[] = [
    { id: 'student-photo', title: 'Student Photo', icon: <Camera className="h-4 w-4" /> },
    { id: 'device-photos', title: 'Device Photos', icon: <Laptop className="h-4 w-4" /> },
    { id: 'form', title: 'Details', icon: <User className="h-4 w-4" /> },
    { id: 'qr-scan', title: 'QR Scan', icon: <QrCode className="h-4 w-4" /> }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const canProceed = () => {
    switch (currentStep) {
      case 'student-photo':
        return !!studentPhoto;
      case 'device-photos':
        return devicePhotos.length >= 1;
      case 'form':
        return formData.studentName && formData.className && formData.deviceDescription;
      case 'qr-scan':
        return !!formData.studentId;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const stepOrder: Step[] = ['student-photo', 'device-photos', 'form', 'qr-scan', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const stepOrder: Step[] = ['student-photo', 'device-photos', 'form', 'qr-scan'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleStudentPhotoCapture = (imageData: string) => {
    setStudentPhoto(imageData);
    setShowCamera(false);
  };

  const handleDevicePhotoCapture = (imageData: string) => {
    setDevicePhotos(prev => [...prev, imageData]);
    setShowCamera(false);
  };

  const handleQRScan = (data: string) => {
    setFormData(prev => ({ ...prev, studentId: data }));
    setShowQRScanner(false);
    toast.success(`Student ID scanned: ${data}`);
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    
    setIsSubmitting(true);
    
    try {
      const newStudent = addStudent({
        studentName: formData.studentName,
        className: formData.className,
        studentId: formData.studentId,
        deviceDescription: formData.deviceDescription,
        studentPhoto,
        devicePhotos
      });
      
      toast.success('Check-in successful!');
      setCurrentStep('complete');
    } catch (error) {
      toast.error('Failed to complete check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep('student-photo');
    setStudentPhoto('');
    setDevicePhotos([]);
    setFormData({ studentName: '', className: '', studentId: '', deviceDescription: '' });
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
          <h1 className="text-2xl font-bold">Student Check-In</h1>
          <p className="text-muted-foreground">Register student and document their device</p>
        </div>

        {/* Progress Steps */}
        {currentStep !== 'complete' && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all
                    ${index <= currentStepIndex 
                      ? 'gradient-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'}
                  `}>
                    {step.icon}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 md:w-16 h-1 mx-1 rounded transition-all ${
                      index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {steps.map((step) => (
                <span key={step.id} className="text-xs text-muted-foreground hidden md:block">
                  {step.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="animate-fade-in">
          {/* Student Photo Step */}
          {currentStep === 'student-photo' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">Capture Student Photo</h2>
                <p className="text-sm text-muted-foreground">Take a clear photo of the student's face</p>
              </div>
              
              {showCamera ? (
                <CameraCapture 
                  onCapture={handleStudentPhotoCapture}
                  onCancel={() => setShowCamera(false)}
                  facingMode="user"
                />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  {studentPhoto ? (
                    <div className="relative">
                      <img 
                        src={studentPhoto} 
                        alt="Student" 
                        className="w-48 h-48 rounded-2xl object-cover shadow-card"
                      />
                      <button
                        onClick={() => setStudentPhoto('')}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-2xl bg-muted flex items-center justify-center">
                      <User className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  <Button variant={studentPhoto ? 'outline' : 'hero'} onClick={() => setShowCamera(true)}>
                    <Camera className="h-4 w-4 mr-2" />
                    {studentPhoto ? 'Retake Photo' : 'Take Photo'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Device Photos Step */}
          {currentStep === 'device-photos' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">Capture Device Photos</h2>
                <p className="text-sm text-muted-foreground">Take 3-6 photos of the student's device from different angles</p>
              </div>
              
              {showCamera ? (
                <CameraCapture 
                  onCapture={handleDevicePhotoCapture}
                  onCancel={() => setShowCamera(false)}
                  facingMode="environment"
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3 justify-center min-h-[100px] p-4 bg-muted/50 rounded-2xl">
                    {devicePhotos.length > 0 ? (
                      <ThumbnailGallery 
                        images={devicePhotos} 
                        editable 
                        size="lg"
                        onRemove={(index) => setDevicePhotos(prev => prev.filter((_, i) => i !== index))}
                      />
                    ) : (
                      <div className="flex items-center justify-center text-muted-foreground">
                        <Laptop className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      variant={devicePhotos.length >= 3 ? 'outline' : 'hero'} 
                      onClick={() => setShowCamera(true)}
                      disabled={devicePhotos.length >= 6}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Photo ({devicePhotos.length}/6)
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Step */}
          {currentStep === 'form' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">Student Details</h2>
                <p className="text-sm text-muted-foreground">Fill in the student information</p>
              </div>
              
              <div className="bg-card rounded-2xl shadow-card p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Student Name</label>
                  <input
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Class</label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData(prev => ({ ...prev, className: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select class</option>
                    <option value="Robotics 101">Robotics 101</option>
                    <option value="Python Programming">Python Programming</option>
                    <option value="AI Fundamentals">AI Fundamentals</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Device Description</label>
                  <input
                    type="text"
                    value={formData.deviceDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, deviceDescription: e.target.value }))}
                    placeholder="e.g., Silver MacBook Pro 14 inch"
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* QR Scan Step */}
          {currentStep === 'qr-scan' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">Scan Student ID</h2>
                <p className="text-sm text-muted-foreground">Scan the QR code on the student's badge</p>
              </div>
              
              {showQRScanner ? (
                <QRScanner 
                  onScan={handleQRScan}
                  onCancel={() => setShowQRScanner(false)}
                />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  {formData.studentId ? (
                    <div className="p-6 bg-success/10 rounded-2xl text-center">
                      <Check className="h-12 w-12 text-success mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Student ID</p>
                      <p className="text-xl font-bold text-success">{formData.studentId}</p>
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-2xl bg-muted flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  <Button variant={formData.studentId ? 'outline' : 'hero'} onClick={() => setShowQRScanner(true)}>
                    <QrCode className="h-4 w-4 mr-2" />
                    {formData.studentId ? 'Scan Again' : 'Scan QR Code'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Complete Step */}
          {currentStep === 'complete' && (
            <div className="text-center py-8 animate-scale-in">
              <div className="w-20 h-20 rounded-full gradient-success flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-success-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Check-In Complete!</h2>
              <p className="text-muted-foreground mb-8">
                Student has been successfully registered
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="hero" onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Check-In
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Back to Home
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep !== 'complete' && !showCamera && !showQRScanner && (
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            
            {currentStep === 'qr-scan' ? (
              <Button 
                variant="hero" 
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Complete Check-In
              </Button>
            ) : (
              <Button 
                variant="hero" 
                onClick={nextStep}
                disabled={!canProceed()}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CheckIn;
