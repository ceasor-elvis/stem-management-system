import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, SwitchCamera, X, Check, RotateCcw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel?: () => void;
  facingMode?: 'user' | 'environment';
  aspectRatio?: 'square' | 'portrait' | 'landscape';
}

export function CameraCapture({ 
  onCapture, 
  onCancel,
  facingMode: initialFacing = 'environment',
  aspectRatio = 'square'
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(initialFacing);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Stop existing stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 1280 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error('Camera error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setCapturedImage(null);
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on video
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;

    // Center crop
    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;

    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
    }
  };

  const retake = () => {
    setCapturedImage(null);
  };

  const aspectRatioClass = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-video'
  }[aspectRatio];

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className={`relative ${aspectRatioClass} bg-foreground/5 rounded-2xl overflow-hidden shadow-card`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="animate-pulse-soft text-muted-foreground">
              <Camera className="h-12 w-12" />
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted p-4">
            <p className="text-destructive text-center text-sm">{error}</p>
          </div>
        )}

        {capturedImage ? (
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => setIsLoading(false)}
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {capturedImage ? (
          <>
            <Button variant="outline" size="lg" onClick={retake}>
              <RotateCcw className="h-5 w-5 mr-2" />
              Retake
            </Button>
            <Button variant="success" size="lg" onClick={confirmCapture}>
              <Check className="h-5 w-5 mr-2" />
              Use Photo
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="icon" onClick={toggleCamera}>
              <SwitchCamera className="h-5 w-5" />
            </Button>
            <Button 
              variant="hero" 
              size="xl" 
              className="rounded-full w-16 h-16"
              onClick={capture}
              disabled={isLoading || !!error}
            >
              <Camera className="h-6 w-6" />
            </Button>
            {onCancel && (
              <Button variant="outline" size="icon" onClick={onCancel}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
