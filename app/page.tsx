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
    const loadData = async (sessionUser?: any) => {
      let user = sessionUser;

      if (!user) {
        // If no user passed, check session from storage
        const { data: { session } } = await supabase.auth.getSession();
        user = session?.user;
        console.log('🔍 Session check:', { hasSession: !!session, hasUser: !!user, email: user?.email });
      }

      if (user) {
        console.log('✅ User found:', user.email);
        // Fetch Profile for Credits
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('tier, daily_credits_used')
          .eq('id', user.id)
          .single();

        console.log('📊 Profile fetch:', { profile, profileError });

        if (profile) {
          const userTier = profile.tier || 'free'; // Default to free if logged in
          setTier(userTier);
          setDailyUsage(profile.daily_credits_used || 0);

          // Calculate Remaining
          const limit = userTier === 'pro' ? 50 : 1;
          setAiCredits(Math.max(0, limit - (profile.daily_credits_used || 0)));
          console.log('✅ Tier set to:', userTier, 'Credits:', limit - (profile.daily_credits_used || 0));
        } else {
          // Logged in but no profile? treat as free instead of guest
          console.warn('⚠️ No profile found for user, defaulting to free');
          setTier('free');
          setAiCredits(1);
        }
      } else {
        console.log('❌ No user session found, setting to guest');
        setTier('guest');
        setAiCredits(0); // Guests have 0 credits (must login)
      }

      if (cvId) {
        // Load from Cloud
        const { data, error } = await supabase.from('cvs').select('*').eq('id', cvId).single();
        if (data) {
          const loadedData = data.data as any;
          setCvData(loadedData as CVData);
          if (loadedData.sections) setSections(loadedData.sections);
          if (loadedData.selectedTemplate) setSelectedTemplate(loadedData.selectedTemplate);
          setStep('sections');
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
            // setAiCredits(parsed.aiCredits); 
          }
        } catch (error) {
          console.error('Error loading from localStorage:', error);
        }
      }
      setIsLoaded(true);
    };

    loadData();

    // Listen for auth changes to ensure we catch login state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Always reload if session exists or if we were logged in and now are not
      loadData(session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
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

  // Handle Start button - create cloud CV if logged in
  const handleStart = async () => {
    // If user is logged in (not guest), create a new CV in Supabase
    if (tier !== 'guest') {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // **FIX: Check CV limit before creating**
        const { data: existingCVs, error: countError } = await supabase
          .from('cvs')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);

        const cvCount = existingCVs?.length || 0;
        const limit = tier === 'pro' ? 4 : 1; // Free/Guest: 1 CV, Pro: 4 CVs

        console.log(`📊 CV Count: ${cvCount}/${limit} (tier: ${tier})`);

        if (cvCount >= limit) {
          // Show appropriate message based on tier
          console.warn('⚠️ CV limit reached, not creating new CV');

          if (tier === 'pro') {
            alert(`You've reached the maximum limit of 4 CVs. Please delete an existing CV to create a new one.`);
          } else {
            alert(`You've reached your CV limit (1 free CV). Upgrade to Pro to create up to 4 CVs.`);
          }
          return;
        }

        const { data, error } = await supabase
          .from('cvs')
          .insert([
            {
              user_id: user.id,
              title: 'Untitled CV',
              data: {
                personal: { name: '', email: '', phone: '', location: '', customFields: [] },
                summary: '',
                experience: [],
                education: [],
                skills: [],
                certification: [],
                language: []
              }
            }
          ])
          .select()
          .single();

        if (data) {
          // Redirect to the new CV with ID
          window.location.href = `/?id=${data.id}`;
          return;
        } else if (error) {
          console.error('Error creating CV:', error);
          alert('Failed to create CV. Please try again.');
          return;
        }
      }
    }

    // If guest or error, use local mode
    setStep('template');
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  let content;

  if (step === 'home') {
    content = <Home onStart={handleStart} />;
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
        hasSavedData={!!cvData.personal.name || !!localStorage.getItem('cvBuilderData')}
        tier={tier}
      />
    );
  } else if (step === 'sections') {
    content = (
      <Sections
        sections={sections}
        setSections={(s) => {
          setSections(s);
        }}
        cvData={cvData}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        onNavigate={setStep}
        onClearData={clearAllData}
        isCloud={!!cvId}
        onSave={handleSaveToCloud}
        isSaving={isSaving}
        tier={tier}
        aiCredits={aiCredits}
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
        isCloud={!!cvId}
        onSave={handleSaveToCloud}
        isSaving={isSaving}
        tier={tier}
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