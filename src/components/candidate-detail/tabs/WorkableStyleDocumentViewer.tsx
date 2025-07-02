
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink, AlertCircle, Loader2 } from "lucide-react";

interface WorkableStyleDocumentViewerProps {
  documentUrl: string;
  fileName?: string;
  fileType?: string;
}

export const WorkableStyleDocumentViewer = ({ 
  documentUrl, 
  fileName = "Document", 
  fileType 
}: WorkableStyleDocumentViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Determine file type from URL or provided type
  const getFileType = () => {
    if (fileType) return fileType.toLowerCase();
    const extension = documentUrl.split('.').pop()?.toLowerCase();
    return extension || 'pdf';
  };

  const documentType = getFileType();

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const openInNewTab = () => window.open(documentUrl, '_blank');

  const renderDocumentControls = () => (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">{fileName}</p>
          <p className="text-sm text-muted-foreground">
            {documentType.toUpperCase()} Document
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
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

  const renderDocumentViewer = () => {
    if (documentType === 'pdf') {
      // Use PDF.js viewer exactly like Workable does
      const pdfViewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(documentUrl)}`;
      
      return (
        <div className="relative bg-muted/30 rounded-lg border border-border overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading document...
              </div>
            </div>
          )}
          
          {hasError ? (
            <div className="flex flex-col items-center justify-center h-96 bg-muted/50 text-center p-6">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Preview not available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Unable to load document preview. You can still download or open it externally.
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
          ) : (
            <iframe
              src={pdfViewerUrl}
              className="w-full h-96 border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="Document Preview"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          )}
        </div>
      );
    }

    // For non-PDF files, use object tag as fallback
    return (
      <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
        <object
          data={documentUrl}
          type="application/pdf"
          className="w-full h-96"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        >
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
        </object>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderDocumentControls()}
      {renderDocumentViewer()}
    </div>
  );
};
