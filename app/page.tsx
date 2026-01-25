'use client';

import React, { useState, useEffect } from 'react';
import { Section, CVData, SavedData } from '../types';
import Home from '../components/Home';
import ChooseTemplate from '../components/ChooseTemplate';
import Sections from '../components/Sections';
import Fill from '../components/Fill';
import ClearDataModal from '../components/ClearDataModal';

export default function CVBuilder() {
  // State definitions with default values (no localStorage access during init)
  const [step, setStep] = useState<string>('home');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const [sections, setSections] = useState<Section[]>([
    { id: 'personal', name: 'Personal Info', required: true, enabled: true },
    { id: 'summary', name: 'Summary', required: true, enabled: true },
    { id: 'experience', name: 'Experience', required: true, enabled: true },
    { id: 'education', name: 'Education', required: true, enabled: true },
    { id: 'skills', name: 'Skills', required: true, enabled: true },
    { id: 'certification', name: 'Certification', required: false, enabled: false },
    { id: 'language', name: 'Language', required: false, enabled: false }
  ]);
  const [cvData, setCvData] = useState<CVData>({
    personal: { name: '', email: '', phone: '', location: '', customFields: [] },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certification: [],
    language: []
  });
  const [aiCredits, setAiCredits] = useState<number>(3);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage ONLY on client-side mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('cvBuilderData');
        if (saved) {
          const parsed: SavedData = JSON.parse(saved);
          setStep(parsed.step);
          setSelectedTemplate(parsed.selectedTemplate);
          setSections(parsed.sections);
          setCvData(parsed.cvData);
          setAiCredits(parsed.aiCredits);
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever relevant data changes
  useEffect(() => {
    try {
      const dataToSave = {
        step,
        selectedTemplate,
        sections,
        cvData,
        aiCredits
      };
      localStorage.setItem('cvBuilderData', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [step, selectedTemplate, sections, cvData, aiCredits]);

  // Clear all data function
  const clearAllData = () => {
    setIsClearModalOpen(true);
  };

  const confirmClearData = () => {
    localStorage.removeItem('cvBuilderData');
    window.location.reload();
  };

  // Prevent hydration mismatch by waiting for load
  if (!isLoaded) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  let content;

  if (step === 'home') {
    content = <Home onStart={() => setStep('template')} />;
  } else if (step === 'template') {
    content = (
      <ChooseTemplate
        selectedTemplate={selectedTemplate}
        onSelectTemplate={(id) => {
          setSelectedTemplate(id);
          setStep('sections');
        }}
        onBack={() => setStep('home')}
        onClearData={clearAllData}
        hasSavedData={cvData.personal.name !== '' || cvData.experience.length > 0}
      />
    );
  } else if (step === 'sections') {
    content = (
      <Sections
        sections={sections}
        setSections={setSections}
        cvData={cvData}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        onNavigate={setStep}
        onClearData={clearAllData}
      />
    );
  } else if (step === 'fill') {
    content = (
      <Fill
        cvData={cvData}
        setCvData={setCvData}
        sections={sections}
        aiCredits={aiCredits}
        setAiCredits={setAiCredits}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        onNavigate={setStep}
        onClearData={clearAllData}
      />
    );
  } else {
    content = <div>Unknown Step</div>;
  }

  return (
    <>
      {content}
      <ClearDataModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={confirmClearData}
      />
    </>
  );
}