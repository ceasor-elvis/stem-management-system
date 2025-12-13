import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, SwitchCamera, X, QrCode } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onCancel?: () => void;
}

export function QRScanner({ onScan, onCancel }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualId, setManualId] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
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

  // Simulate QR scanning (in production, use a QR library like @zxing/browser)
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || isLoading || error) return;

    const checkForQR = () => {
      // In a real implementation, you would use a QR scanning library here
      // For demo purposes, we'll use manual input
    };

    const interval = setInterval(checkForQR, 500);
    return () => clearInterval(interval);
  }, [isLoading, error]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleManualSubmit = () => {
    if (manualId.trim()) {
      onScan(manualId.trim());
    }
  };

  // Demo function - simulate scanning
  const simulateScan = () => {
    const demoIds = ['STU001', 'STU002', 'STU003'];
    const randomId = demoIds[Math.floor(Math.random() * demoIds.length)];
    onScan(randomId);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {!showManualInput ? (
        <>
          <div className="relative aspect-[4/3] bg-foreground/5 rounded-2xl overflow-hidden shadow-card">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="animate-pulse-soft text-muted-foreground">
                  <QrCode className="h-12 w-12" />
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-4 gap-4">
                <p className="text-destructive text-center text-sm">{error}</p>
                <Button variant="outline" onClick={() => setShowManualInput(true)}>
                  Enter ID Manually
                </Button>
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={() => setIsLoading(false)}
              className="w-full h-full object-cover"
            />

            {/* QR Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-primary rounded-2xl relative">
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                
                {/* Scanning line animation */}
                <div className="absolute left-2 right-2 top-0 h-0.5 bg-primary animate-pulse" 
                  style={{ animation: 'scan 2s ease-in-out infinite' }} 
                />
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button variant="outline" size="icon" onClick={toggleCamera}>
              <SwitchCamera className="h-5 w-5" />
            </Button>
            <Button variant="hero" onClick={simulateScan}>
              <QrCode className="h-5 w-5 mr-2" />
              Simulate Scan (Demo)
            </Button>
            {onCancel && (
              <Button variant="outline" size="icon" onClick={onCancel}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          <button 
            onClick={() => setShowManualInput(true)}
            className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Or enter Student ID manually
          </button>
        </>
      ) : (
        <div className="space-y-4 p-6 bg-card rounded-2xl shadow-card">
          <h3 className="text-lg font-semibold text-center">Enter Student ID</h3>
          <input
            type="text"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder="e.g., STU001"
            className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowManualInput(false)}>
              Back to Scanner
            </Button>
            <Button variant="hero" className="flex-1" onClick={handleManualSubmit}>
              Submit
            </Button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: calc(100% - 2px); }
        }
      `}</style>
    </div>
  );
}
