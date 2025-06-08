
import { useState, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "@/components/create-role-modal/utils/types";

interface TabCompletionState {
  tab1Complete: boolean;
  tab2Complete: boolean;
  tab3Complete: boolean;
  tab4Complete: boolean;
  tab3Skipped: boolean;
  tab4Skipped: boolean;
}

export const useTabCompletion = (
  form: UseFormReturn<FormData>,
  generatedJobPost: string,
  generatedSkillsTest: string
) => {
  const [tab3Skipped, setTab3Skipped] = useState(false);
  const [tab4Skipped, setTab4Skipped] = useState(false);

  // Watch specific form fields instead of the watch function
  const title = form.watch("title");
  const description = form.watch("description");
  const employment_type = form.watch("employment_type");
  const experience_level = form.watch("experience_level");
  const required_skills = form.watch("required_skills");
  const location_type = form.watch("location_type");
  const country = form.watch("country");
  const city = form.watch("city");

  const tabCompletion = useMemo((): TabCompletionState => {
    console.log('Tab completion recalculating with:', {
      title,
      description,
      employment_type,
      experience_level,
      required_skills,
      location_type,
      country,
      city,
      generatedJobPost: !!generatedJobPost,
      generatedSkillsTest: !!generatedSkillsTest,
      tab3Skipped,
      tab4Skipped
    });
    
    // Tab 1: Role Details - check required fields (removed status)
    const tab1Complete = !!(
      title &&
      description &&
      employment_type &&
      experience_level &&
      required_skills
    );

    // Tab 2: Location - check location fields
    const tab2Complete = !!(
      location_type &&
      (location_type === 'remote' || 
       (country && (location_type === 'onsite' ? city : true)))
    );

    // Tab 3: AI Job Post - either generated or skipped
    const tab3Complete = !!(generatedJobPost || tab3Skipped);

    // Tab 4: Skills Test - either generated or skipped
    const tab4Complete = !!(generatedSkillsTest || tab4Skipped);

    const result = {
      tab1Complete,
      tab2Complete,
      tab3Complete,
      tab4Complete,
      tab3Skipped,
      tab4Skipped
    };

    console.log('Tab completion result:', result);
    return result;
  }, [
    title,
    description,
    employment_type,
    experience_level,
    required_skills,
    location_type,
    country,
    city,
    generatedJobPost,
    generatedSkillsTest,
    tab3Skipped,
    tab4Skipped
  ]);

  const allTabsComplete = useMemo(() => {
    const result = tabCompletion.tab1Complete && 
                   tabCompletion.tab2Complete && 
                   tabCompletion.tab3Complete && 
                   tabCompletion.tab4Complete;
    console.log('All tabs complete:', result);
    return result;
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
