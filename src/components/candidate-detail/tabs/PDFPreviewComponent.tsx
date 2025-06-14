
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink, AlertCircle } from "lucide-react";

interface PDFPreviewComponentProps {
  resumeUrl: string;
  fileName?: string;
}

export const PDFPreviewComponent = ({ resumeUrl, fileName = "Resume.pdf" }: PDFPreviewComponentProps) => {
  const [previewError, setPreviewError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setPreviewError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setPreviewError(true);
  };

  const openInNewTab = () => {
    window.open(resumeUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Download and Actions Section */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">{fileName}</p>
            <p className="text-sm text-muted-foreground">Candidate's resume</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={openInNewTab}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open
          </Button>
          <Button 
            variant="outline" 
            asChild
            size="sm"
            className="flex items-center gap-2"
          >
            <a 
              href={resumeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              download
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </Button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="relative">
        <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center h-96 bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-foreground"></div>
                Loading preview...
              </div>
            </div>
          )}
          
          {previewError ? (
            <div className="flex flex-col items-center justify-center h-96 bg-muted/50 text-center p-6">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Preview not available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This document cannot be previewed in the browser. This is common with certain PDF files.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={openInNewTab}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in new tab
                </Button>
                <Button variant="outline" asChild>
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer" download>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              src={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=page-fit`}
              className={`w-full h-96 border-0 ${isLoading ? 'hidden' : 'block'}`}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="Resume Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          )}
        </div>
      </div>
    </div>
  );
};
