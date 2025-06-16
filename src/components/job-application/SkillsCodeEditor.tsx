
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Code } from "lucide-react";

interface SkillsCodeEditorProps {
  value: string;
  onChange: (value: string, language: string) => void;
  className?: string;
}

export const SkillsCodeEditor = ({
  value,
  onChange,
  className = ""
}: SkillsCodeEditorProps) => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(value);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onChange(newCode, language);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    onChange(code, newLanguage);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <Code className="w-5 h-5 text-gray-600" />
        <div className="flex-1">
          <Label htmlFor="language-select">Programming Language</Label>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="csharp">C#</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="go">Go</SelectItem>
              <SelectItem value="rust">Rust</SelectItem>
              <SelectItem value="php">PHP</SelectItem>
              <SelectItem value="ruby">Ruby</SelectItem>
              <SelectItem value="sql">SQL</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="relative">
        <Textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder={`// Enter your ${language} code here...
function solution() {
  // Your implementation
}`}
          className="font-mono text-sm min-h-[300px] resize-none bg-gray-900 text-green-400 border-gray-700"
          rows={15}
        />
      </div>
      
      <div className="text-xs text-gray-500">
        <p>Language: <span className="font-medium text-gray-700">{language}</span></p>
        <p>Characters: <span className="font-medium text-gray-700">{code.length}</span></p>
      </div>
    </div>
  );
};
