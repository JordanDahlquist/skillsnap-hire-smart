
export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  companySize: string;
  industry: string;
  jobTitle: string;
}

export const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees", 
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees"
];

export const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Consulting",
  "Marketing & Advertising",
  "Real Estate",
  "Non-profit",
  "Other"
];

export interface PasswordRequirement {
  text: string;
  met: boolean;
}
