
import { useState, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";

interface TabCompletionState {
  tab1Complete: boolean;
  tab2Complete: boolean;
  tab3Complete: boolean;
  tab4Complete: boolean;
  tab3Skipped: boolean;
  tab4Skipped: boolean;
}

export const useTabCompletion = (
  form: UseFormReturn<any>,
  generatedJobPost: string,
  generatedSkillsTest: string
) => {
  const [tab3Skipped, setTab3Skipped] = useState(false);
  const [tab4Skipped, setTab4Skipped] = useState(false);

  const tabCompletion = useMemo((): TabCompletionState => {
    const values = form.getValues();
    
    // Tab 1: Role Details - check required fields
    const tab1Complete = !!(
      values.title &&
      values.description &&
      values.employment_type &&
      values.experience_level &&
      values.required_skills
    );

    // Tab 2: Location - check location fields
    const tab2Complete = !!(
      values.location_type &&
      (values.location_type === 'remote' || 
       (values.country && (values.location_type === 'onsite' ? values.city : true)))
    );

    // Tab 3: AI Job Post - either generated or skipped
    const tab3Complete = !!(generatedJobPost || tab3Skipped);

    // Tab 4: Skills Test - either generated or skipped
    const tab4Complete = !!(generatedSkillsTest || tab4Skipped);

    return {
      tab1Complete,
      tab2Complete,
      tab3Complete,
      tab4Complete,
      tab3Skipped,
      tab4Skipped
    };
  }, [form.watch(), generatedJobPost, generatedSkillsTest, tab3Skipped, tab4Skipped]);

  const allTabsComplete = useMemo(() => {
    return tabCompletion.tab1Complete && 
           tabCompletion.tab2Complete && 
           tabCompletion.tab3Complete && 
           tabCompletion.tab4Complete;
  }, [tabCompletion]);

  const getIncompleteTabsMessage = () => {
    const incomplete = [];
    if (!tabCompletion.tab1Complete) incomplete.push("Role Details");
    if (!tabCompletion.tab2Complete) incomplete.push("Location");
    if (!tabCompletion.tab3Complete) incomplete.push("AI Job Post");
    if (!tabCompletion.tab4Complete) incomplete.push("Skills Test");
    
    if (incomplete.length === 0) return "";
    return `Complete these tabs to publish: ${incomplete.join(", ")}`;
  };

  return {
    tabCompletion,
    allTabsComplete,
    tab3Skipped,
    tab4Skipped,
    setTab3Skipped,
    setTab4Skipped,
    getIncompleteTabsMessage
  };
};
