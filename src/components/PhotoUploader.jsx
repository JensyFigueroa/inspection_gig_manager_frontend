import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { getDeviceName, canUseCamera, convertImageToBase64, compressImage } from '../utils/deviceDetector';
import { toast } from 'sonner';

export default function PhotoUploader({ photos, onPhotosChange }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  const deviceName = getDeviceName();
  const hasCamera = canUseCamera();

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const newPhotos = [];
      
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a valid image`);
          continue;
        }

        const compressedFile = await compressImage(file, 1200, 0.8);
        const base64 = await convertImageToBase64(compressedFile);
        newPhotos.push(base64);
      }

      if (newPhotos.length > 0) {
        onPhotosChange([...photos, ...newPhotos]);
        toast.success(`${newPhotos.length} Photo(s) added`);
      }
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Error processing images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
    toast.success('Photo deleted');
  };

  return (
    <div>
      <div className="mb-3">
        <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
          Photos ({deviceName})
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-secondary flex items-center gap-2 flex-1"
          >
            <Upload size={18} />
            Upload from Photos
          </button>
          
          {hasCamera && (
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploading}
              className="btn-primary flex items-center gap-2 flex-1"
            >
              <Camera size={18} />
              Take Photo
            </button>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {hasCamera && (
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
        )}
        
        {uploading && (
          <p className="font-mono text-xs text-slate-500 mt-2">Procesing image...</p>
        )}
      </div>

      {photos.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {photos.map((photo, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200"
            >
              <img 
                src={photo} 
                alt={`Photo ${index + 1}`} 
                className="w-16 h-16 object-cover rounded border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-slate-600 truncate">
                  Photo {index + 1}
                </p>
                <p className="font-mono text-xs text-slate-400">
                  {photo.length > 100 ? `${(photo.length / 1024).toFixed(1)} KB` : 'URL'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="p-1 hover:bg-red-100 rounded transition-colors"
              >
                <X size={16} className="text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}