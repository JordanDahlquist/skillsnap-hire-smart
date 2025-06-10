
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
  path?: string;
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

  const validateFile = (file: File): string | null => {
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return `File ${file.name} exceeds the 50MB limit`;
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`;
    }

    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const newAttachments: AttachmentFile[] = [];
    const errors: string[] = [];

    try {
      for (const file of files) {
        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(validationError);
          continue;
        }

        // Generate consistent file ID and path
        const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const filePath = `${user?.id}/${fileId}-${file.name}`;

        console.log(`Uploading file: ${file.name} to path: ${filePath}`);

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('email-attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          errors.push(`Failed to upload ${file.name}: ${uploadError.message}`);
          continue;
        }

        // Get public URL for display purposes
        const { data: { publicUrl } } = supabase.storage
          .from('email-attachments')
          .getPublicUrl(filePath);

        // Create attachment object with both URL and path
        const attachment: AttachmentFile = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicUrl,
          path: filePath, // Store the full path for backend access
          file
        };

        newAttachments.push(attachment);
        console.log(`Successfully uploaded: ${file.name} (ID: ${fileId})`);
      }

      // Update attachments list
      if (newAttachments.length > 0) {
        onAttachmentsChange([...attachments, ...newAttachments]);
        toast({
          title: "Files uploaded",
          description: `${newAttachments.length} file(s) uploaded successfully`,
        });
      }

      // Show errors if any
      if (errors.length > 0) {
        toast({
          title: "Upload errors",
          description: errors.join(', '),
          variant: "destructive",
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
    if (attachment?.path) {
      // Delete from storage
      const { error } = await supabase.storage
        .from('email-attachments')
        .remove([attachment.path]);
      
      if (error) {
        console.error('Failed to delete file from storage:', error);
      }
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
        <p className="text-xs text-gray-500 mt-1">
          Supported: Images, PDF, Word, Excel, Text files (max 50MB each)
        </p>
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
