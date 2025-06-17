
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { uploadSkillsFile, validateFile, formatFileSize, FileUploadResult } from "@/utils/skillsFileUpload";
import { useAuth } from "@/hooks/useAuth";

interface SkillsFileUploadProps {
  questionId: string;
  acceptedTypes?: string;
  maxSizeMB?: number;
  onFileUploaded: (result: FileUploadResult) => void;
  existingFile?: {
    url: string;
    fileName: string;
    fileSize: number;
  };
  className?: string;
}

export const SkillsFileUpload = ({
  questionId,
  acceptedTypes = "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/*,video/*,application/zip",
  maxSizeMB = 50,
  onFileUploaded,
  existingFile,
  className = ""
}: SkillsFileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileUpload = async (file: File) => {
    if (!user) {
      setUploadError("Please log in to upload files");
      return;
    }

    if (!validateFile(file, maxSizeMB)) {
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    try {
      const result = await uploadSkillsFile(file, questionId, user.id);
      if (result) {
        setUploadProgress(100);
        onFileUploaded(result);
      } else {
        setUploadError("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError("Upload failed. Please check your connection and try again.");
    } finally {
      clearInterval(progressInterval);
      setUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
        setUploadError(null);
      }, 2000);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {existingFile ? (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                {existingFile.fileName}
              </p>
              <p className="text-xs text-green-600">
                {formatFileSize(existingFile.fileSize)} • Uploaded successfully
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(existingFile.url, '_blank')}
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              View File
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Replace
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            dragOver 
              ? 'border-blue-400 bg-blue-50 scale-105' 
              : uploading
              ? 'border-blue-300 bg-blue-25'
              : uploadError
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-600 animate-bounce" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-700">Uploading file...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                <p className="text-xs text-blue-600">{Math.round(uploadProgress)}% complete</p>
              </div>
            </div>
          ) : uploadError ? (
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700">Upload failed</p>
                <p className="text-xs text-red-600">{uploadError}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <File className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-900 mb-2">
                  Drop your file here, or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 underline font-medium"
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-gray-500">
                  PDF, DOC, TXT, images, videos, or ZIP files up to {maxSizeMB}MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  );
};
