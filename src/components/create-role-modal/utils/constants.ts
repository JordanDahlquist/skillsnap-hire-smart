
import { z } from "zod";

export const formSchema = z.object({
  title: z.string().min(2, {
    message: "Job title must be at least 2 characters."
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters."
  }),
  experience_level: z.string(),
  required_skills: z.string(),
  budget: z.string(),
  duration: z.string(),
  employment_type: z.string(),
  location_type: z.string(),
  country: z.string(),
  state: z.string(),
  region: z.string(),
  city: z.string()
});

export const DEFAULT_FORM_VALUES = {
  title: "",
  description: "",
  experience_level: "mid-level",
  required_skills: "",
  budget: "",
  duration: "",
  employment_type: "full-time",
  location_type: "remote",
  country: "United States",
  state: "",
  region: "",
  city: ""
};

export const EMPLOYMENT_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "temporary", label: "Temporary" },
  { value: "internship", label: "Internship" },
  { value: "project", label: "Project" }
];

export const EXPERIENCE_LEVELS = [
  { value: "entry-level", label: "Entry Level" },
  { value: "mid-level", label: "Mid Level" },
  { value: "senior-level", label: "Senior Level" }
];
