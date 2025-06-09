
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Bold, 
  Italic, 
  Link, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Underline,
  Quote
} from 'lucide-react';

interface EmailRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const EmailRichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Type your message...",
  disabled = false 
}: EmailRichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  const handleCommand = useCallback((command: string, value?: string) => {
    if (disabled) return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange, disabled]);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      setSavedRange(range.cloneRange());
      return range;
    }
    return null;
  };

  const restoreSelection = () => {
    if (savedRange && editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedRange);
        editorRef.current.focus();
      }
    }
  };

  const handleLinkClick = () => {
    if (!editorRef.current || disabled) return;
    
    editorRef.current.focus();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = saveSelection();
      if (range && !range.collapsed) {
        setLinkText(range.toString());
      } else {
        setLinkText('');
      }
    }
    setShowLinkDialog(true);
  };

  const insertLink = () => {
    if (!linkUrl || !editorRef.current) return;

    editorRef.current.focus();
    restoreSelection();

    const selection = window.getSelection();
    if (selection && savedRange) {
      selection.removeAllRanges();
      selection.addRange(savedRange);

      const finalLinkText = linkText || linkUrl;
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline;">${finalLinkText}</a>`;

      if (savedRange.collapsed) {
        const linkElement = document.createElement('div');
        linkElement.innerHTML = linkHtml;
        const linkNode = linkElement.firstChild;
        
        if (linkNode) {
          savedRange.insertNode(linkNode);
          savedRange.setStartAfter(linkNode);
          savedRange.setEndAfter(linkNode);
          selection.removeAllRanges();
          selection.addRange(savedRange);
        }
      } else {
        savedRange.deleteContents();
        const linkElement = document.createElement('div');
        linkElement.innerHTML = linkHtml;
        const linkNode = linkElement.firstChild;
        
        if (linkNode) {
          savedRange.insertNode(linkNode);
          savedRange.setStartAfter(linkNode);
          savedRange.setEndAfter(linkNode);
          selection.removeAllRanges();
          selection.addRange(savedRange);
        }
      }

      onChange(editorRef.current.innerHTML);
    }

    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
    setSavedRange(null);
  };

  const handleInput = () => {
    if (editorRef.current && !disabled) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const convertToHtml = (text: string) => {
    if (text.startsWith('<')) return text;
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline;">$1</a>')
      .replace(/\n/g, '<br>');
  };

  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      const htmlContent = convertToHtml(value);
      if (editorRef.current.innerHTML !== htmlContent) {
        editorRef.current.innerHTML = htmlContent;
      }
    }
  }, [value]);

  const toolbarButtons = [
    { command: 'bold', icon: Bold, title: 'Bold' },
    { command: 'italic', icon: Italic, title: 'Italic' },
    { command: 'underline', icon: Underline, title: 'Underline' },
    { command: 'insertUnorderedList', icon: List, title: 'Bullet List' },
    { command: 'insertOrderedList', icon: ListOrdered, title: 'Numbered List' },
    { command: 'formatBlock', icon: Quote, title: 'Quote', value: 'blockquote' },
    { command: 'justifyLeft', icon: AlignLeft, title: 'Align Left' },
    { command: 'justifyCenter', icon: AlignCenter, title: 'Align Center' },
    { command: 'justifyRight', icon: AlignRight, title: 'Align Right' },
  ];

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border rounded-lg bg-gray-50 flex-wrap">
        {toolbarButtons.map(({ command, icon: Icon, title, value }) => (
          <Button
            key={command}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleCommand(command, value)}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title={title}
          >
            <Icon className="w-4 h-4" />
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLinkClick}
          disabled={disabled}
          className="h-8 w-8 p-0"
          title="Add Link"
        >
          <Link className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        className={`min-h-[120px] w-full p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          disabled ? 'bg-gray-50 cursor-not-allowed' : ''
        }`}
        style={{ 
          wordWrap: 'break-word', 
          whiteSpace: 'pre-wrap',
          lineHeight: '1.5'
        }}
        data-placeholder={placeholder}
      />

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="linkText">Link Text</Label>
              <Input
                id="linkText"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Enter link text"
              />
            </div>
            <div>
              <Label htmlFor="linkUrl">URL</Label>
              <Input
                id="linkUrl"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={insertLink} disabled={!linkUrl}>
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        [contenteditable][data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
        }
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        [contenteditable] strong {
          font-weight: bold;
        }
        [contenteditable] em {
          font-style: italic;
        }
        [contenteditable] u {
          text-decoration: underline;
        }
        [contenteditable] ul {
          list-style-type: disc;
          margin-left: 20px;
          margin-bottom: 10px;
        }
        [contenteditable] ol {
          list-style-type: decimal;
          margin-left: 20px;
          margin-bottom: 10px;
        }
        [contenteditable] blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 16px;
          margin: 10px 0;
          font-style: italic;
          color: #6b7280;
        }
        [contenteditable] li {
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
};
