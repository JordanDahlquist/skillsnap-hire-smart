
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  variables: string[];
}

export interface Application {
  id: string;
  name: string;
  email: string;
}

export interface Job {
  id: string;
  title: string;
  company_name?: string;
}

export interface EmailComposerData {
  selectedApplications: Application[];
  job: Job;
}

export interface EmailFormData {
  templateId: string;
  subject: string;
  content: string;
}
