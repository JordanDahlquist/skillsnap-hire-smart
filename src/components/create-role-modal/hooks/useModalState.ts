
import { useState } from "react";

export const useModalState = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [generatedJobPost, setGeneratedJobPost] = useState("");
  const [generatedSkillsTest, setGeneratedSkillsTest] = useState("");
  const [uploadedPdfContent, setUploadedPdfContent] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [rewriteWithAI, setRewriteWithAI] = useState(true);

  const resetState = () => {
    setGeneratedJobPost("");
    setGeneratedSkillsTest("");
    setUploadedPdfContent(null);
    setUploadedFileName(null);
    setRewriteWithAI(true);
    setActiveTab("1");
  };

  return {
    activeTab,
    setActiveTab,
    generatedJobPost,
    setGeneratedJobPost,
    generatedSkillsTest,
    setGeneratedSkillsTest,
    uploadedPdfContent,
    setUploadedPdfContent,
    uploadedFileName,
    setUploadedFileName,
    rewriteWithAI,
    setRewriteWithAI,
    resetState
  };
};
