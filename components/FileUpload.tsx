"use client";

import { useState, useRef } from "react";
import { Button } from "@whop/react/components";

interface FileUploadProps {
  onUpload: (fileUrl: string, filename: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

export default function FileUpload({
  onUpload,
  accept = "image/*,.pdf",
  maxSize = 5,
  disabled = false
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onUpload(data.url, data.filename);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <Button
        type="button"
        variant="ghost"
        size="2"
        onClick={handleButtonClick}
        disabled={disabled || isUploading}
        className="text-blue-600 hover:text-blue-700"
      >
        {isUploading ? "Uploading..." : "📎 Attach File"}
      </Button>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <p className="text-xs text-gray-500">
        Max file size: {maxSize}MB. Supported: Images, PDF
      </p>
    </div>
  );
}