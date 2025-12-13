import { useState } from 'react';
import { X, ZoomIn, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ThumbnailGalleryProps {
  images: string[];
  onRemove?: (index: number) => void;
  editable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ThumbnailGallery({ 
  images, 
  onRemove, 
  editable = false,
  size = 'md' 
}: ThumbnailGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  if (images.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {images.map((image, index) => (
          <div 
            key={index}
            className={`relative ${sizeClasses[size]} rounded-xl overflow-hidden shadow-sm group cursor-pointer transition-transform hover:scale-105`}
            onClick={() => setSelectedImage(image)}
          >
            <img 
              src={image} 
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
              <ZoomIn className="h-4 w-4 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {editable && onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-foreground/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[80vh] animate-scale-in">
            <img 
              src={selectedImage} 
              alt="Full size"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-xl"
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute -top-4 -right-4"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
