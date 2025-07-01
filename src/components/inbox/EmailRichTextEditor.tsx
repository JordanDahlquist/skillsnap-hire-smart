import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bold, Italic, Link, List } from 'lucide-react';
import { InlineLinkPopover } from './InlineLinkPopover';

interface Variable {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface EmailRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  variables?: Variable[];
}

export const EmailRichTextEditor = ({ 
  value, 
  onChange, 
  placeholder, 
  disabled = false,
  variables = []
}: EmailRichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const currentContentRef = useRef<string>('');

  const handleCommand = useCallback((command: string, commandValue?: string) => {
    if (disabled || !editorRef.current) return;
    
    document.execCommand(command, false, commandValue);
    const newContent = editorRef.current.innerHTML;
    currentContentRef.current = newContent;
    onChange(newContent);
  }, [onChange, disabled]);

  const handleBold = () => handleCommand('bold');
  const handleItalic = () => handleCommand('italic');
  const handleList = () => handleCommand('insertUnorderedList');

  const handleVariableClick = (variableName: string) => {
    if (disabled || !editorRef.current) return;
    
    editorRef.current.focus();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textNode = document.createTextNode(` ${variableName}`);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
      
      const newContent = editorRef.current.innerHTML;
      currentContentRef.current = newContent;
      onChange(newContent);
    }
  };

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
        setSelectedText(range.toString());
      } else {
        setSelectedText('');
      }
    }
    
    setShowLinkPopover(true);
  };

  const handleInsertLink = (url: string, text?: string) => {
    if (!url || !editorRef.current || disabled) return;

    editorRef.current.focus();
    restoreSelection();

    const selection = window.getSelection();
    if (selection && savedRange) {
      selection.removeAllRanges();
      selection.addRange(savedRange);

      const finalLinkText = text || selectedText || url;
      const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${finalLinkText}</a>`;

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

      const newContent = editorRef.current.innerHTML;
      currentContentRef.current = newContent;
      onChange(newContent);
    }

    setSavedRange(null);
  };

  const handleInput = useCallback(() => {
    if (editorRef.current && !disabled) {
      const newContent = editorRef.current.innerHTML;
      currentContentRef.current = newContent;
      onChange(newContent);
    }
  }, [onChange, disabled]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const convertToHtml = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');
  };

  // Only update innerHTML when content changes from outside (different thread/value)
  useEffect(() => {
    if (editorRef.current && value !== currentContentRef.current) {
      const htmlContent = value.startsWith('<') ? value : convertToHtml(value);
      editorRef.current.innerHTML = htmlContent;
      currentContentRef.current = value;
    }
  }, [value]);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .email-rich-text-editor [contenteditable][data-placeholder]:empty::before {
        content: attr(data-placeholder);
        color: #9ca3af;
        font-style: italic;
      }
      .email-rich-text-editor [contenteditable] a {
        color: #3b82f6;
        text-decoration: underline;
      }
      .email-rich-text-editor [contenteditable] strong {
        font-weight: bold;
      }
      .email-rich-text-editor [contenteditable] em {
        font-style: italic;
      }
      .email-rich-text-editor [contenteditable] ul {
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
    <div className="email-rich-text-editor h-full flex flex-col border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Compact Toolbar with Variables */}
      <div className="flex-shrink-0 border-b bg-gray-50/50 p-1">
        <div className="flex items-center gap-1">
          {/* Formatting buttons */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBold}
            disabled={disabled}
            className="h-6 w-6 p-0"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3 h-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleItalic}
            disabled={disabled}
            className="h-6 w-6 p-0"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3 h-3" />
          </Button>
          
          {/* Link button with popover */}
          <InlineLinkPopover
            open={showLinkPopover}
            onOpenChange={setShowLinkPopover}
            onInsertLink={handleInsertLink}
            selectedText={selectedText}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLinkClick}
              disabled={disabled}
              className="h-6 w-6 p-0"
              title="Add Link"
            >
              <Link className="w-3 h-3" />
            </Button>
          </InlineLinkPopover>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleList}
            disabled={disabled}
            className="h-6 w-6 p-0"
            title="Bullet List"
          >
            <List className="w-3 h-3" />
          </Button>

          {/* Separator if variables exist */}
          {variables.length > 0 && (
            <div className="w-px h-4 bg-gray-300 mx-1" />
          )}

          {/* Variable buttons */}
          {variables.map((variable) => {
            const IconComponent = variable.icon;
            return (
              <button
                key={variable.name}
                onClick={() => handleVariableClick(variable.name)}
                disabled={disabled}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-white border rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={variable.description}
              >
                <IconComponent className="w-3 h-3 text-gray-500" />
                <code className="text-blue-600">{variable.name}</code>
              </button>
            );
          })}
        </div>
      </div>

      {/* Enhanced Editor Content with Internal Scrolling */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div
            ref={editorRef}
            contentEditable={!disabled}
            onInput={handleInput}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`
              w-full p-4 min-h-full focus:outline-none text-sm cursor-text
              transition-all duration-200 ease-in-out
              ${disabled 
                ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
                : isFocused 
                  ? 'bg-blue-50/30 border-blue-200' 
                  : 'bg-gray-50/30 hover:bg-blue-50/20'
              }
              ${!value && !disabled ? 'hover:bg-blue-50/30' : ''}
            `}
            style={{ 
              wordWrap: 'break-word', 
              whiteSpace: 'pre-wrap',
              lineHeight: '1.5',
              minHeight: '120px'
            }}
            data-placeholder={placeholder}
            suppressContentEditableWarning={true}
          />
        </ScrollArea>
      </div>
    </div>
  );
};
