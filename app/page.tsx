'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Section, CVData, SavedData } from '../types';
import Home from '../components/Home';
import ChooseTemplate from '../components/ChooseTemplate';
import Sections from '../components/Sections';
import Fill from '../components/Fill';
import ClearDataModal from '../components/ClearDataModal';
import Review from '../components/Review'; // Import Review Component
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';
import Toast, { ToastType } from '../components/Toast';

function BuilderContent() {
  const searchParams = useSearchParams();
  const cvId = searchParams.get('id');
  const supabase = createClient();

  // State definitions
  const [step, setStep] = useState<string>('home');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Data State
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

  // Auth & Credit State
  const [tier, setTier] = useState<'guest' | 'free' | 'pro'>('guest');
  const [dailyUsage, setDailyUsage] = useState<number>(0);
  const [aiCredits, setAiCredits] = useState<number>(0); // Computed remaining credits
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Initial Load Logic
  useEffect(() => {
    const init = async () => {
      // Check User Session First
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch Profile for Credits
        const { data: profile } = await supabase
          .from('profiles')
          .select('tier, daily_credits_used')
          .eq('id', user.id)
          .single();

        if (profile) {
          const userTier = profile.tier || 'free'; // Default to free if logged in
          setTier(userTier);
          setDailyUsage(profile.daily_credits_used || 0);

          // Calculate Remaining
          const limit = userTier === 'pro' ? 50 : 1;
          setAiCredits(Math.max(0, limit - (profile.daily_credits_used || 0)));
        } else {
          // Logged in but no profile? treat as free
          setTier('free');
          setAiCredits(1);
        }
      } else {
        setTier('guest');
        setAiCredits(0); // Guests have 0 credits (must login)
      }

      if (cvId) {
        // Load from Cloud
        const { data, error } = await supabase.from('cvs').select('*').eq('id', cvId).single();
        if (data) {
          // data.data contains the cvData JSON. 
          // Note: our table structure stores `data` as jsonb. 
          // We need mapping if the schema inside differs, but I used `data` to store the whole CV object in plan.
          // Let's assume data.data IS the object containing cvData + sections + selectedTemplate etc?
          // The dashboard creation inserted: 
          /* 
              data: {
                  personal: ...,
                  summary: ...,
                  ...
              }
          */
          // It missed `sections` and `selectedTemplate` in the DB insert structure!
          // Use defaults if missing, or update DB schema/insert logic. 
          // For now, I'll update Create logic later or merge here.
          // Fix: Restore sections and template from the saved payload
          // The payload was saved as { ...cvData, sections, selectedTemplate }
          const loadedData = data.data as any;

          // Construct CVData from the payload (excluding sections/template which are separate)
          // Actually, since we spread ...cvData into the root, the root IS a superset of CVData.
          // We can just pass loadedData to setCvData, extra keys are fine in JS state.
          setCvData(loadedData as CVData);

          if (loadedData.sections) {
            setSections(loadedData.sections);
          }
          if (loadedData.selectedTemplate) {
            setSelectedTemplate(loadedData.selectedTemplate);
          }
          // Restore other states if saved, else default.
          setStep('sections'); // directly go to sections if editing
        } else {
          console.error("CV not found", error);
        }
      } else {
        // Guest / LocalStorage Load
        try {
          const saved = localStorage.getItem('cvBuilderData');
          if (saved) {
            const parsed: SavedData = JSON.parse(saved);
            setStep(parsed.step);
            setSelectedTemplate(parsed.selectedTemplate);
            setSections(parsed.sections);
            setCvData(parsed.cvData);
            // setAiCredits(parsed.aiCredits); // Don't trust local credits anymore
          }
        } catch (error) {
          console.error('Error loading from localStorage:', error);
        }
      }
      setIsLoaded(true);
    };
    init();
  }, [cvId]);

  // Save Logic
  useEffect(() => {
    if (!isLoaded) return;

    // Always save to localStorage as backup/guest
    if (!cvId) {
      const dataToSave = {
        step,
        selectedTemplate,
        sections,
        cvData,
        aiCredits
      };
      localStorage.setItem('cvBuilderData', JSON.stringify(dataToSave));
    }
  }, [step, selectedTemplate, sections, cvData, aiCredits, cvId, isLoaded]);

  const handleSaveToCloud = async () => {
    if (!cvId) return;
    setIsSaving(true);

    // Update the `data` column with current cvData. 
    // Ideally we should also save `sections` and `selectedTemplate` to DB?
    // My DB schema `data` column is jsonb. I can put everything there.

    const fullPayload = {
      ...cvData,
      // We might want to store sections/template config separately or nested? 
      // For MVP, if I only update `cvData`, I lose section order.
      // Let's assume `data` column stores EVERYTHING needed to reconstruct the CV.
      sections,
      selectedTemplate
    };

    const { error } = await supabase
      .from('cvs')
      .update({
        data: fullPayload,
        title: cvData.personal.name ? `${cvData.personal.name}'s CV` : 'Untitled CV',
        updated_at: new Date().toISOString()
      })
      .eq('id', cvId);

    setIsSaving(false);
    if (error) {
      setToast({ message: 'Error saving CV', type: 'error' });
    } else {
      setToast({ message: 'CV saved successfully!', type: 'success' });
    }
  };

  // Clear all data function
  const clearAllData = () => {
    setIsClearModalOpen(true);
  };

  const confirmClearData = () => {
    localStorage.removeItem('cvBuilderData');
    window.location.reload();
  };

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
          if (cvId) handleSaveToCloud(); // Auto-save selection if cloud
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
        setSections={(s) => {
          setSections(s);
          // Note: Cloud save on each change might be too much. 
          // Maybe add explicit Save button or debounce?
          // For now, I'll pass handleSaveToCloud to Sections to use manually or debounced?
          // Actually, Sections just lists things. Let's not auto-save every drag.
          // But we need a Save Button UI if in Cloud mode.
        }}
        cvData={cvData}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        onNavigate={setStep}
        onClearData={clearAllData}
        // New Props for Cloud
        isCloud={!!cvId}
        onSave={handleSaveToCloud}
        isSaving={isSaving}
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
        // New Props for Cloud
        isCloud={!!cvId}
        onSave={handleSaveToCloud}
        isSaving={isSaving}
      />
    );
  } else if (step === 'review') {
    content = (
      <Review
        cvData={cvData}
        setCvData={setCvData}
        onNavigate={setStep}
        sections={sections}
        selectedTemplate={selectedTemplate}
        aiCredits={aiCredits}
        setAiCredits={setAiCredits}
        tier={tier}
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

export default function CVBuilder() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BuilderContent />
    </Suspense>
  );
}