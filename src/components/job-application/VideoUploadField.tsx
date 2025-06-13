
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Play, X, FileVideo } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface VideoUploadFieldProps {
  questionId: string;
  onVideoUploaded: (videoUrl: string, fileName: string, fileSize: number) => void;
  existingVideoUrl?: string;
  existingFileName?: string;
  className?: string;
}

export const VideoUploadField = ({
  questionId,
  onVideoUploaded,
  existingVideoUrl,
  existingFileName,
  className = ""
}: VideoUploadFieldProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const validateFile = (file: File) => {
    const maxSize = 1024 * 1024 * 1024; // 1GB
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/avi'];
    
    if (file.size > maxSize) {
      toast.error("File size must be less than 1GB");
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid video file (MP4, WebM, MOV, AVI)");
      return false;
    }
    
    return true;
  };

  const uploadVideo = async (file: File) => {
    if (!user || !validateFile(file)) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${questionId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('skills-assessments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            questionId,
            originalName: file.name,
            size: file.size.toString()
          }
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('skills-assessments')
        .getPublicUrl(data.path);

      onVideoUploaded(publicUrl, file.name, file.size);
      toast.success("Video uploaded successfully!");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload video. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      uploadVideo(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {existingVideoUrl ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <FileVideo className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {existingFileName || 'Video uploaded'}
                </p>
                <p className="text-xs text-green-600">Ready for review</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const video = document.createElement('video');
                  video.src = existingVideoUrl;
                  video.controls = true;
                  video.style.maxWidth = '100%';
                  video.style.maxHeight = '400px';
                  
                  const dialog = document.createElement('dialog');
                  dialog.style.padding = '20px';
                  dialog.style.border = 'none';
                  dialog.style.borderRadius = '8px';
                  dialog.style.maxWidth = '80vw';
                  dialog.style.maxHeight = '80vh';
                  
                  const closeButton = document.createElement('button');
                  closeButton.innerHTML = '×';
                  closeButton.style.position = 'absolute';
                  closeButton.style.top = '10px';
                  closeButton.style.right = '10px';
                  closeButton.style.background = 'none';
                  closeButton.style.border = 'none';
                  closeButton.style.fontSize = '24px';
                  closeButton.style.cursor = 'pointer';
                  closeButton.onclick = () => {
                    dialog.close();
                    document.body.removeChild(dialog);
                  };
                  
                  dialog.appendChild(closeButton);
                  dialog.appendChild(video);
                  document.body.appendChild(dialog);
                  dialog.showModal();
                }}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                <Play className="w-4 h-4 mr-1" />
                Preview
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
                <p className="text-sm font-medium">Uploading video...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                <p className="text-xs text-gray-500">{uploadProgress}% complete</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <FileVideo className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Drop your video here, or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  MP4, WebM, MOV, AVI up to 1GB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/avi"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  );
};
