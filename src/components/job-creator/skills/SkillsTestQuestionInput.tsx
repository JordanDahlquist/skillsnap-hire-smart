
import { Upload, Link, Code, FileText, Video, List } from "lucide-react";
import { SkillsQuestion } from "@/types/skillsAssessment";

interface SkillsTestQuestionInputProps {
  type: string;
  question?: SkillsQuestion;
}

export const SkillsTestQuestionInput = ({ type, question }: SkillsTestQuestionInputProps) => {
  const renderInput = () => {
    switch (type) {
      case 'text':
        return (
          <input 
            type="text" 
            placeholder="Your answer here..." 
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700"
            disabled 
          />
        );

      case 'long_text':
        return (
          <textarea 
            placeholder="Your detailed response here..." 
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 h-24 resize-none text-gray-700"
            disabled 
          />
        );

      case 'file_upload':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium mb-1">Click to upload file</p>
            <p className="text-sm text-gray-500">PDF, DOC, TXT, ZIP up to 50MB</p>
          </div>
        );

      case 'video_upload':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <Video className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium mb-1">Click to upload video</p>
            <p className="text-sm text-gray-500">MP4, WebM, MOV up to 50MB</p>
          </div>
        );

      case 'portfolio_link':
      case 'video_link':
      case 'url_submission':
        return (
          <div className="space-y-2">
            <input 
              type="url" 
              placeholder="https://your-portfolio.com" 
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700"
              disabled 
            />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link className="w-4 h-4" />
              <span>Provide a valid URL link</span>
            </div>
          </div>
        );

      case 'code_submission':
        return (
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm border">
            <div className="flex items-center gap-2 mb-2 text-gray-400">
              <Code className="w-4 h-4" />
              <span className="text-xs">Code Editor</span>
            </div>
            <div className="text-gray-500">// Your code implementation here...</div>
            <div className="text-gray-600">function solution() {'{'}  </div>
            <div className="text-gray-600 ml-4">// Write your solution</div>
            <div className="text-gray-600">{'}'}</div>
          </div>
        );

      case 'multiple_choice':
        const options = question?.multipleChoice?.options || [];
        const allowMultiple = question?.multipleChoice?.allowMultiple || false;
        const inputType = allowMultiple ? 'checkbox' : 'radio';

        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <List className="w-4 h-4" />
              <span>Select {allowMultiple ? 'all that apply' : 'one option'}</span>
            </div>
            <div className="space-y-2">
              {options.map((option, index) => (
                <label key={index} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-not-allowed">
                  <input 
                    type={inputType}
                    name="preview-options"
                    disabled
                    className="text-blue-600 focus:ring-blue-500 cursor-not-allowed"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <input 
            type="text" 
            placeholder="Your answer here..." 
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700"
            disabled 
          />
        );
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600 font-medium">Preview - How candidates will see this</span>
      </div>
      {renderInput()}
    </div>
  );
};
