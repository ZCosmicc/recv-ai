export interface CustomField {
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
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    current: boolean;
}

export interface Education {
    degree: string;
    major: string;
    institution: string;
    year: string;
}

export interface Project {
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

export interface CVData {
    personal: PersonalInfo;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: string[];
    projects: Project[];
    certification: string[];
    language: string[];
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
