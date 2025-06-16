
import { useJobCreatorState } from "./job-creator/useJobCreatorState";
import { createJobCreatorActions } from "./job-creator/useJobCreatorActions";
import { useJobContentGeneration } from "./job-creator/useJobContentGeneration";
import { useJobSaving } from "./job-creator/useJobSaving";

export const useUnifiedJobCreator = (
  onJobCreated?: () => void,
  onClose?: (open: boolean) => void,
  editingJob?: any
) => {
  const { state, setState, resetState } = useJobCreatorState();
  const actions = createJobCreatorActions(setState);
  const { generateJobPost, generateSkillsQuestions, generateInterviewQuestions } = useJobContentGeneration();
  const { saveJob } = useJobSaving();

  const handleGenerateJobPost = async () => {
    await generateJobPost(
      state.formData, 
      actions.setIsGenerating, 
      actions.setGeneratedJobPost,
      state.websiteAnalysisData
    );
  };

  const handleGenerateSkillsQuestions = async () => {
    await generateSkillsQuestions(state.generatedJobPost, actions.setIsGenerating, actions.setSkillsTestData);
  };

  const handleGenerateInterviewQuestions = async () => {
    await generateInterviewQuestions(
      state.formData,
      state.generatedJobPost,
      state.skillsTestData,
      actions.setIsGenerating,
      actions.setGeneratedInterviewQuestions
    );
  };

  const handleSaveJob = async (status: 'draft' | 'active') => {
    await saveJob(state, status, actions.setIsSaving, resetState, onJobCreated, onClose);
  };

  return {
    state,
    actions,
    handleGenerateJobPost,
    handleGenerateSkillsQuestions,
    handleGenerateInterviewQuestions,
    handleSaveJob
  };
};
