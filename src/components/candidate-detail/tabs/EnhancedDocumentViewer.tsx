
import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Download, 
  ExternalLink, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  AlertCircle
} from "lucide-react";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface EnhancedDocumentViewerProps {
  documentUrl: string;
  fileName?: string;
  fileType?: string;
}

export const EnhancedDocumentViewer = ({ 
  documentUrl, 
  fileName = "Document", 
  fileType 
}: EnhancedDocumentViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wordContent, setWordContent] = useState<string | null>(null);

  // Determine file type from URL or provided type
  const getFileType = useCallback(() => {
    if (fileType) return fileType.toLowerCase();
    const extension = documentUrl.split('.').pop()?.toLowerCase();
    return extension || 'pdf';
  }, [documentUrl, fileType]);

  const documentType = getFileType();

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: any) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF document');
    setIsLoading(false);
  };

  const loadWordDocument = useCallback(async () => {
    if (documentType !== 'docx' && documentType !== 'doc') return;
    
    try {
      setIsLoading(true);
      const response = await fetch(documentUrl);
      const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setWordContent(result.value);
      setIsLoading(false);
    } catch (error) {
      console.error('Word document load error:', error);
      setError('Failed to load Word document');
      setIsLoading(false);
    }
  }, [documentUrl, documentType]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || 1));

  const openInNewTab = () => window.open(documentUrl, '_blank');

  const renderDocumentControls = () => (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">{fileName}</p>
          <p className="text-sm text-muted-foreground">
            {documentType.toUpperCase()} Document
            {numPages && ` • ${numPages} pages`}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {documentType === 'pdf' && numPages && (
          <>
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground mx-2">
              {Math.round(scale * 100)}%
            </span>
          </>
        )}
        
        <Button variant="outline" size="sm" onClick={openInNewTab}>
          <ExternalLink className="w-4 h-4" />
          Open
        </Button>
        
        <Button variant="outline" size="sm" asChild>
          <a href={documentUrl} download>
            <Download className="w-4 h-4" />
            Download
          </a>
        </Button>
      </div>
    </div>
  );

  const renderPageNavigation = () => {
    if (documentType !== 'pdf' || !numPages || numPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-center gap-4 p-4 bg-muted/30 rounded-lg border border-border">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <span className="text-sm text-muted-foreground">
          Page {pageNumber} of {numPages}
        </span>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={goToNextPage}
          disabled={pageNumber >= numPages}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  const renderDocumentContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96 bg-muted/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading document...
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 bg-muted/50 text-center p-6">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Preview not available</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={openInNewTab}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in new tab
            </Button>
            <Button variant="outline" asChild>
              <a href={documentUrl} download>
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </Button>
          </div>
        </div>
      );
    }

    // PDF rendering with react-pdf
    if (documentType === 'pdf') {
      return (
        <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
          <Document
            file={documentUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center h-96">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            }
          >
            <div className="flex justify-center p-4">
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </div>
          </Document>
        </div>
      );
    }

    // Word document rendering
    if ((documentType === 'docx' || documentType === 'doc') && wordContent) {
      return (
        <div className="bg-muted/30 rounded-lg border border-border p-6 max-h-96 overflow-y-auto">
          <div 
            className="prose prose-sm max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: wordContent }}
          />
        </div>
      );
    }

    // Fallback for unsupported formats
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-muted/50 text-center p-6">
        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Preview not available</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This file format ({documentType.toUpperCase()}) cannot be previewed in the browser.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openInNewTab}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in new tab
          </Button>
          <Button variant="outline" asChild>
            <a href={documentUrl} download>
              <Download className="w-4 h-4 mr-2" />
              Download
            </a>
          </Button>
        </div>
      </div>
    );
  };

  // Load Word document on mount if applicable
  useState(() => {
    if (documentType === 'docx' || documentType === 'doc') {
      loadWordDocument();
    }
  });

  return (
    <div className="space-y-4">
      {renderDocumentControls()}
      {renderPageNavigation()}
      {renderDocumentContent()}
    </div>
  );
};
