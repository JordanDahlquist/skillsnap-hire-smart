
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  const handleCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleBold = () => handleCommand('bold');
  const handleItalic = () => handleCommand('italic');
  const handleList = () => handleCommand('insertUnorderedList');

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
    if (!editorRef.current) return;
    
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
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${finalLinkText}</a>`;

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
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const convertToHtml = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');
  };

  const handleDialogClose = () => {
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
    setSavedRange(null);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault();
        onSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    }
  };

  useEffect(() => {
    if (editorRef.current && value) {
      const htmlContent = value.startsWith('<') ? value : convertToHtml(value);
      editorRef.current.innerHTML = htmlContent;
    }
  }, [value]);

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
    <div className="rich-text-editor h-full flex flex-col" onKeyDown={handleKeyDown}>
      {/* Fixed Header - Toolbar */}
      <div className="flex-shrink-0 border-b bg-gray-50">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBold}
              className="h-8 w-8"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleItalic}
              className="h-8 w-8"
              title="Italic (Ctrl+I)"
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
          
          {/* Action Buttons in Header */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              onClick={onSave}
              size="sm"
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Flexible Content Area - Scrollable Editor */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="w-full p-4 min-h-full focus:outline-none bg-white"
            style={{ 
              wordWrap: 'break-word', 
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6'
            }}
            data-placeholder={placeholder}
          />
        </ScrollArea>
      </div>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={handleDialogClose}>
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
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button onClick={insertLink} disabled={!linkUrl}>
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
