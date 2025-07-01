
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Link, Check, X, Edit3 } from 'lucide-react';

interface InlineLinkPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertLink: (url: string, text?: string) => void;
  selectedText?: string;
  children: React.ReactNode;
}

export const InlineLinkPopover = ({
  open,
  onOpenChange,
  onInsertLink,
  selectedText = '',
  children
}: InlineLinkPopoverProps) => {
  const [url, setUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showTextField, setShowTextField] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Auto-format URL
  const formatUrl = (input: string) => {
    if (!input) return input;
    if (!input.startsWith('http://') && !input.startsWith('https://')) {
      return `https://${input}`;
    }
    return input;
  };

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setUrl('');
      setLinkText(selectedText);
      setShowTextField(false);
      // Focus the URL input after a brief delay
      setTimeout(() => {
        urlInputRef.current?.focus();
      }, 100);
    }
  }, [open, selectedText]);

  const handleInsert = () => {
    if (!url.trim()) return;
    
    const formattedUrl = formatUrl(url.trim());
    const finalText = showTextField && linkText.trim() ? linkText.trim() : undefined;
    
    onInsertLink(formattedUrl, finalText);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInsert();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onOpenChange(false);
    }
  };

  const previewText = showTextField && linkText.trim() 
    ? linkText.trim() 
    : selectedText || url || 'Link';

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Link className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Add Link</span>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url-input" className="text-xs font-medium">
              URL
            </Label>
            <Input
              ref={urlInputRef}
              id="url-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com"
              className="text-sm"
            />
          </div>

          {/* Link Text Field (conditional) */}
          {showTextField && (
            <div className="space-y-2">
              <Label htmlFor="text-input" className="text-xs font-medium">
                Link Text
              </Label>
              <Input
                id="text-input"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter link text"
                className="text-sm"
              />
            </div>
          )}

          {/* Preview */}
          {url && (
            <div className="p-2 bg-gray-50 rounded-md border">
              <div className="text-xs text-gray-500 mb-1">Preview:</div>
              <a
                href={formatUrl(url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm break-all"
              >
                {previewText}
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTextField(!showTextField)}
              className="text-xs px-2 h-7"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              {showTextField ? 'Hide' : 'Edit'} Text
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-7 px-2"
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
              <Button
                onClick={handleInsert}
                disabled={!url.trim()}
                size="sm"
                className="h-7 px-3"
              >
                <Check className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
