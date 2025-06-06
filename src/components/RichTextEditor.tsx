
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Bold, Italic, Link, List, Save, X } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
}

export const RichTextEditor = ({ value, onChange, onSave, onCancel, placeholder }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const handleCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleBold = () => handleCommand('bold');
  const handleItalic = () => handleCommand('italic');
  const handleList = () => handleCommand('insertUnorderedList');

  const handleLinkClick = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setLinkText(selection.toString());
    }
    setShowLinkDialog(true);
  };

  const insertLink = () => {
    if (linkUrl) {
      if (linkText) {
        // If we have link text, create the full link
        handleCommand('insertHTML', `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`);
      } else {
        // If no text selected, just insert the URL as both text and link
        handleCommand('insertHTML', `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkUrl}</a>`);
      }
    }
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const convertToHtml = (text: string) => {
    // Convert plain text or basic markdown to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');
  };

  useEffect(() => {
    if (editorRef.current && value) {
      const htmlContent = value.startsWith('<') ? value : convertToHtml(value);
      editorRef.current.innerHTML = htmlContent;
    }
  }, [value]);

  // Add custom CSS styles directly to the component
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .rich-text-editor [contenteditable][data-placeholder]:empty::before {
        content: attr(data-placeholder);
        color: #9ca3af;
        font-style: italic;
      }
      .rich-text-editor [contenteditable] a {
        color: #3b82f6;
        text-decoration: underline;
      }
      .rich-text-editor [contenteditable] strong {
        font-weight: bold;
      }
      .rich-text-editor [contenteditable] em {
        font-style: italic;
      }
      .rich-text-editor [contenteditable] ul {
        list-style-type: disc;
        margin-left: 20px;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="rich-text-editor space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBold}
          className="h-8 w-8"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleItalic}
          className="h-8 w-8"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLinkClick}
          className="h-8 w-8"
          title="Add Link"
        >
          <Link className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleList}
          className="h-8 w-8"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[400px] w-full p-4 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}
        data-placeholder={placeholder}
      />

      {/* Save/Cancel buttons */}
      <div className="flex gap-2">
        <Button
          onClick={onSave}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </Button>
      </div>

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
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={insertLink}>
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
