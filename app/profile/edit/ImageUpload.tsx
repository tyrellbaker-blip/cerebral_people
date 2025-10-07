"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  userId: string;
  onImageUploaded: (url: string) => void;
}

export default function ImageUpload({ currentImageUrl, userId, onImageUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload via API route
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const { url } = await response.json();

      // Call the callback with the new URL
      onImageUploaded(url);

      setPreviewUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className="flex-shrink-0">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Profile preview"
              width={96}
              height={96}
              className="rounded-full border-4 border-amber-200 object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-amber-200 bg-amber-100 flex items-center justify-center">
              <span className="text-3xl font-bold text-amber-700">?</span>
            </div>
          )}
        </div>

        {/* Upload button */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg bg-amber-600 text-white px-4 py-2 font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? "Uploading..." : previewUrl ? "Change Photo" : "Upload Photo"}
          </button>
          <p className="text-xs text-amber-600 mt-2">
            JPG, PNG, or GIF. Max 5MB.
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}
