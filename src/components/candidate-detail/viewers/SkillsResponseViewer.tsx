
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Video, 
  Link as LinkIcon, 
  Code, 
  Upload, 
  ExternalLink,
  Download,
  Eye,
  List
} from "lucide-react";
import { formatFileSize } from "@/utils/skillsFileUpload";

interface SkillsResponse {
  questionId?: string;
  question: string;
  answer: string;
  answerType?: 'text' | 'video' | 'file' | 'url' | 'code' | 'multiple_choice';
  videoUrl?: string;
  videoFileName?: string;
  videoFileSize?: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  codeLanguage?: string;
  metadata?: any;
}

interface SkillsResponseViewerProps {
  response: SkillsResponse;
  questionIndex: number;
}

export const SkillsResponseViewer = ({ 
  response, 
  questionIndex 
}: SkillsResponseViewerProps) => {
  const getResponseIcon = (type?: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'file':
        return Upload;
      case 'url':
        return LinkIcon;
      case 'code':
        return Code;
      case 'multiple_choice':
        return List;
      default:
        return FileText;
    }
  };

  const getResponseTypeLabel = (type?: string) => {
    switch (type) {
      case 'video':
        return 'Video Response';
      case 'file':
        return 'File Upload';
      case 'url':
        return 'URL Submission';
      case 'code':
        return 'Code Submission';
      case 'multiple_choice':
        return 'Multiple Choice';
      default:
        return 'Text Response';
    }
  };

  // Convert URLs in plain text into clickable links
  const linkify = (text: string) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text
      .split(urlPattern)
      .map((part, i) => {
        if (/^https?:\/\/[^\s]+$/.test(part)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline break-words"
            >
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      });
  };

  const renderResponseContent = () => {
    switch (response.answerType) {
      case 'video':
        if (response.videoUrl) {
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      {response.videoFileName || 'Video Response'}
                    </p>
                    {response.videoFileSize && (
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        {formatFileSize(response.videoFileSize)}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const video = document.createElement('video');
                    video.src = response.videoUrl!;
                    video.controls = true;
                    video.style.maxWidth = '100%';
                    video.style.maxHeight = '400px';
                    
                    const dialog = document.createElement('dialog');
                    dialog.style.padding = '20px';
                    dialog.style.border = 'none';
                    dialog.style.borderRadius = '8px';
                    dialog.style.maxWidth = '80vw';
                    dialog.style.maxHeight = '80vh';
                    
                    const closeButton = document.createElement('button');
                    closeButton.innerHTML = '×';
                    closeButton.style.position = 'absolute';
                    closeButton.style.top = '10px';
                    closeButton.style.right = '10px';
                    closeButton.style.background = 'none';
                    closeButton.style.border = 'none';
                    closeButton.style.fontSize = '24px';
                    closeButton.style.cursor = 'pointer';
                    closeButton.onclick = () => {
                      dialog.close();
                      document.body.removeChild(dialog);
                    };
                    
                    dialog.appendChild(closeButton);
                    dialog.appendChild(video);
                    document.body.appendChild(dialog);
                    dialog.showModal();
                  }}
                  className="text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Play Video
                </Button>
              </div>
            </div>
          );
        }
        break;

      case 'file':
        if (response.fileUrl) {
          const isPDF = response.fileType === 'application/pdf';
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      {response.fileName || 'Uploaded File'}
                    </p>
                    {response.fileSize && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {formatFileSize(response.fileSize)} • {response.fileType}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isPDF && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(response.fileUrl, '_blank')}
                      className="text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View PDF
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = response.fileUrl!;
                      link.download = response.fileName || 'file';
                      link.click();
                    }}
                    className="text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
              
              {isPDF && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <iframe
                    src={response.fileUrl}
                    className="w-full h-96"
                    title="PDF Preview"
                  />
                </div>
              )}
            </div>
          );
        }
        break;

      case 'url':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 truncate">
                    {response.answer}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    URL Submission
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(response.answer, '_blank')}
                className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Visit Link
              </Button>
            </div>
          </div>
        );

      case 'code':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted border border-border rounded-lg">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Code Submission
                  </p>
                  {response.codeLanguage && (
                    <p className="text-xs text-muted-foreground">
                      Language: {response.codeLanguage}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant="outline">
                {response.codeLanguage || 'Code'}
              </Badge>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap break-words">
                {response.answer}
              </pre>
            </div>
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <List className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Selected Options
                </p>
              </div>
              <div className="space-y-2">
                {response.answer.split(',').filter(Boolean).map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                    <span className="text-blue-800 dark:text-blue-200">{option.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default: // text response
        return (
          <div className="p-4 bg-muted border border-border rounded-lg">
            <div className="text-foreground whitespace-pre-wrap break-words leading-relaxed">
              {linkify(response.answer)}
            </div>
          </div>
        );
    }

    return (
      <div className="p-4 bg-muted border border-border rounded-lg">
        <div className="text-foreground whitespace-pre-wrap break-words leading-relaxed">
          {linkify(response.answer)}
        </div>
      </div>
    );
  };

  const IconComponent = getResponseIcon(response.answerType);

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-medium text-foreground mb-2">
              Question {questionIndex + 1}
            </CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {response.question}
            </p>
          </div>
          <Badge 
            variant="outline" 
            className="ml-4 flex items-center gap-1"
          >
            <IconComponent className="w-3 h-3" />
            {getResponseTypeLabel(response.answerType)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {renderResponseContent()}
      </CardContent>
    </Card>
  );
};
