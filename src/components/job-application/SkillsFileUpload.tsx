
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, File, X } from "lucide-react";
import { uploadSkillsFile, validateFile, formatFileSize, FileUploadResult } from "@/utils/skillsFileUpload";
import { useAuth } from "@/hooks/useAuth";

interface SkillsFileUploadProps {
  questionId: string;
  acceptedTypes: string;
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
  acceptedTypes,
  maxSizeMB = 50,
  onFileUploaded,
  existingFile,
  className = ""
}: SkillsFileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileUpload = async (file: File) => {
    if (!user || !validateFile(file, maxSizeMB)) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const result = await uploadSkillsFile(file, questionId, user.id);
      if (result) {
        setUploadProgress(100);
        onFileUploaded(result);
      }
    } finally {
      clearInterval(progressInterval);
      setUploading(false);
      setUploadProgress(0);
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

  return (
    <div className={`space-y-4 ${className}`}>
      {existingFile ? (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <File className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                {existingFile.fileName}
              </p>
              <p className="text-xs text-green-600">
                {formatFileSize(existingFile.fileSize)}
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
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
        >
          {uploading ? (
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-600 animate-bounce" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploading file...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                <p className="text-xs text-gray-500">{uploadProgress}% complete</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <File className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Drop your file here, or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum {maxSizeMB}MB
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
