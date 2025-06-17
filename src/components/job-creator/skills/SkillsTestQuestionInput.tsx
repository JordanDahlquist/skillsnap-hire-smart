
import { Upload, Link, Code } from "lucide-react";

interface SkillsTestQuestionInputProps {
  type: string;
}

export const SkillsTestQuestionInput = ({ type }: SkillsTestQuestionInputProps) => {
  const renderInput = () => {
    switch (type) {
      case 'text':
        return (
          <input 
            type="text" 
            placeholder="Your answer here..." 
            className="w-full bg-white border border-gray-300 rounded px-3 py-2"
            disabled 
          />
        );

      case 'long_text':
        return (
          <textarea 
            placeholder="Your detailed response here..." 
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 h-20 resize-none"
            disabled 
          />
        );

      case 'video_upload':
      case 'file_upload':
      case 'pdf_upload':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              {type === 'video_upload' ? 'Click to upload video or record' : 'Click to upload file'}
            </p>
          </div>
        );

      case 'portfolio_link':
      case 'video_link':
      case 'url_submission':
        return (
          <input 
            type="url" 
            placeholder="https://..." 
            className="w-full bg-white border border-gray-300 rounded px-3 py-2"
            disabled 
          />
        );

      case 'code_submission':
        return (
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
            <div className="text-gray-500">// Your code here...</div>
            <div className="text-gray-600">function solution() {'{'}  </div>
            <div className="text-gray-600 ml-4">// Implementation</div>
            <div className="text-gray-600">{'}'}</div>
          </div>
        );

      default:
        return (
          <input 
            type="text" 
            placeholder="Your answer here..." 
            className="w-full bg-white border border-gray-300 rounded px-3 py-2"
            disabled 
          />
        );
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      {renderInput()}
    </div>
  );
};
