import React, { useRef, useState } from 'react';
import { Camera } from 'lucide-react';

interface ProfilePictureUploadProps {
  currentImage: string;
  onImageChange: (file: File) => void;
}

export function ProfilePictureUpload({ currentImage, onImageChange }: ProfilePictureUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create a FileReader to get base64 data
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Set preview URL
        setPreviewUrl(reader.result);
        // Pass the file to parent
        onImageChange(file);
      }
    };
    reader.readAsDataURL(file);

  };

  return (
    <div className="flex justify-center mb-8">
      <div className="relative group">
        <img
          src={previewUrl}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-4 border-red-600"
        />
        <button
          type="button"
          onClick={handleImageClick}
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Camera className="w-8 h-8 text-white" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>
    </div>
  );
}