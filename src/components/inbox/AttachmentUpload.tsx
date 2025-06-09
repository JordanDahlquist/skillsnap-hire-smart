
import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';

interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
}

interface AttachmentUploadProps {
  attachments: AttachmentFile[];
  onAttachmentsChange: (attachments: AttachmentFile[]) => void;
  disabled?: boolean;
}

export const AttachmentUpload = ({ attachments, onAttachmentsChange, disabled }: AttachmentUploadProps) => {
  const { user } = useOptimizedAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type === 'application/pdf') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const newAttachments: AttachmentFile[] = [];

    try {
      for (const file of files) {
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
          toast({
            title: "File too large",
            description: `${file.name} exceeds the 50MB limit`,
            variant: "destructive",
          });
          continue;
        }

        const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const filePath = `${user?.id}/${fileId}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('email-attachments')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          });
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('email-attachments')
          .getPublicUrl(filePath);

        newAttachments.push({
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicUrl,
          file
        });
      }

      onAttachmentsChange([...attachments, ...newAttachments]);
      
      if (newAttachments.length > 0) {
        toast({
          title: "Files uploaded",
          description: `${newAttachments.length} file(s) uploaded successfully`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload attachments",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = async (attachmentId: string) => {
    const attachment = attachments.find(a => a.id === attachmentId);
    if (attachment?.url) {
      // Extract file path from URL for deletion
      const urlParts = attachment.url.split('/');
      const filePath = `${user?.id}/${attachment.id}-${attachment.name}`;
      
      await supabase.storage
        .from('email-attachments')
        .remove([filePath]);
    }

    onAttachmentsChange(attachments.filter(a => a.id !== attachmentId));
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
          disabled={disabled || uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Attach Files'}
        </Button>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded border"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getFileIcon(attachment.type)}
                <span className="text-sm font-medium truncate">
                  {attachment.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({formatFileSize(attachment.size)})
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(attachment.id)}
                disabled={disabled}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
