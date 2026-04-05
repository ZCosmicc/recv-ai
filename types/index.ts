export interface CustomField {
    id: string;
    label: string;
    value: string;
}

export interface PersonalInfo {
    name: string;
    email: string;
    phone: string;
    location: string;
    customFields: CustomField[];
}

export interface Experience {
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    current: boolean;
}

export interface Education {
    id: string;
    degree: string;
    major: string;
    institution: string;
    year: string;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    technologies: string;
    link: string;
}

export interface Section {
    id: string;
    name: string;
    required: boolean;
    enabled: boolean;
}

export interface SkillItem { id: string; value: string; }
export interface CertItem { id: string; value: string; }
export interface LangItem { id: string; value: string; }

export interface CVData {
    personal: PersonalInfo;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: SkillItem[];
    projects: Project[];
    certification: CertItem[];
    language: LangItem[];
}

export interface SavedData {
    step: string;
    selectedTemplate: string | null;
    sections: Section[];
    cvData: CVData;
    aiCredits: number;
}

export interface Template {
    id: string;
    name: string;
    description: string;
}
