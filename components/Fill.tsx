'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
    ChevronLeft, Trash2, Info, GripVertical, X, Plus, Sparkles, Download, Menu
} from 'lucide-react';
import { CVData, Section } from '../types';
import CVPreview, { templates } from './CVPreview';

interface FillProps {
    cvData: CVData;
    setCvData: (data: CVData) => void;
    sections: Section[];
    aiCredits: number;
    setAiCredits: (credits: number) => void;
    selectedTemplate: string | null;
    setSelectedTemplate: (id: string) => void;
    onNavigate: (step: string) => void;
    onClearData: () => void;
}

const Tooltip = ({ id, text }: { id: string; text: string }) => {
    const [active, setActive] = useState(false);
    return (
        <div className="relative inline-block">
            <button
                type="button"
                onMouseEnter={() => setActive(true)}
                onMouseLeave={() => setActive(false)}
                onClick={() => setActive(!active)}
                className="text-blue-500 hover:text-blue-700 ml-1"
            >
                <Info className="w-4 h-4 inline" />
            </button>
            {active && (
                <div className="absolute z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded shadow-lg -top-2 left-6">
                    {text}
                    <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                </div>
            )}
        </div>
    );
};

export default function Fill({
    cvData,
    setCvData,
    sections,
    aiCredits,
    setAiCredits,
    selectedTemplate,
    setSelectedTemplate,
    onNavigate,
    onClearData
}: FillProps) {
    const [draggedItem, setDraggedItem] = useState<number | null>(null);
    const [draggedItemType, setDraggedItemType] = useState<string | null>(null);

    const downloadPDF = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to download PDF');
            return;
        }

        const element = document.getElementById('cv-preview-for-pdf');
        if (!element) {
            alert('Preview not found');
            return;
        }

        const content = element.innerHTML;

        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${cvData.personal.name || 'My CV'}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              .print-instructions { display: none !important; }
              body { 
                margin: 0; 
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                color-adjust: exact;
              }
              @page { 
                margin: 10mm; 
                size: A4;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              .watermark {
                position: fixed;
                bottom: 10mm;
                right: 10mm;
                text-align: center;
                opacity: 0.6;
              }
              .watermark-text {
                font-size: 10px;
                color: #666;
                margin-bottom: 6px;
                font-weight: 500;
              }
              .watermark-logo {
                width: 80px;
                height: 35px;
                object-fit: contain;
              }
            }
            @media screen {
              .watermark {
                position: fixed;
                bottom: 20px;
                right: 20px;
                text-align: center;
                opacity: 0.6;
                z-index: 1000;
              }
              .watermark-text {
                font-size: 12px;
                color: #666;
                margin-bottom: 8px;
                font-weight: 500;
              }
              .watermark-logo {
                width: 100px;
                height: 45px;
                object-fit: contain;
              }
              .print-instructions {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                color: black;
                padding: 24px;
                border: 4px solid black;
                box-shadow: 6px 6px 0px 0px #000;
                z-index: 9999;
                max-width: 320px;
              }
              .print-instructions h3 {
                margin: 0 0 16px 0;
                font-size: 20px;
                font-weight: 800;
                text-transform: uppercase;
                color: #0079FF;
              }
              .print-instructions ol {
                margin: 16px 0;
                padding-left: 20px;
                font-weight: 500;
              }
              .print-instructions li {
                margin: 8px 0;
                font-size: 14px;
              }
              .print-instructions button {
                width: 100%;
                padding: 12px;
                margin-top: 12px;
                background: #0079FF;
                color: white;
                border: 2px solid black;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 2px 2px 0px 0px #000;
                transition: transform 0.1s, box-shadow 0.1s;
              }
              .print-instructions button:hover {
                transform: translate(2px, 2px);
                box-shadow: none;
              }
              .print-instructions button.cancel-btn {
                background: #ef4444;
              }
            }
            body { 
              font-family: system-ui, -apple-system, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          <div class="print-instructions">
            <h3>📥 Download as PDF</h3>
            <ol>
              <li>Destination: <strong>Save as PDF</strong></li>
              <li>Turn OFF "Headers and footers"</li>
              <li>Turn ON "Background graphics"</li>
              <li>Click <strong>Save</strong></li>
            </ol>
            <button onclick="window.print()">Open Print Dialog</button>
            <button class="cancel-btn" onclick="window.close()">Cancel</button>
          </div>
          
          <div id="cv-content">
            ${content}
          </div>

          <!-- Watermark -->
          <div class="watermark">
            <div class="watermark-text">Created by</div>
            <img src="/LogoPrimaryReCV.png" alt="Logo" class="watermark-logo" />
          </div>

          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            };
            document.addEventListener('contextmenu', event => event.preventDefault());
            document.onkeydown = function(e) {
              // Disable F12
              if (event.keyCode == 123) {
                return false;
              }
              // Disable Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Chrome, Edge, etc.)
              if (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74 || e.keyCode == 67)) {
                return false;
              }
              // Disable Ctrl+U (View source)
              if (e.ctrlKey && e.keyCode == 85) {
                return false;
              }
            };
          </script>
        </body>
      </html>
    `);

        printWindow.document.close();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="border-b-4 border-black bg-primary text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-neo">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
                    <Image src="/LogoPrimaryReCV.png" alt="ReCV Logo" width={120} height={40} className="object-contain" />
                </div>
                <div className="hidden md:flex items-center gap-8 font-bold text-sm">
                    <a href="#" className="hover:underline decoration-2 underline-offset-4" onClick={() => onNavigate('home')}>Home</a>
                    <a href="#" className="hover:underline decoration-2 underline-offset-4">Features</a>
                    <a href="#" className="hover:underline decoration-2 underline-offset-4">Pricing</a>
                    <a href="#" className="hover:underline decoration-2 underline-offset-4">FAQ</a>
                    <button className="text-black bg-white px-6 py-2 border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold">Log in</button>
                    <button className="text-black bg-white px-6 py-2 border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold">Sign Up</button>
                </div>
            </nav>

            <div className="flex-1 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto p-4 md:p-8 relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">Fill Your CV</h1>
                            <p className="text-black font-medium">Complete each section below</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onClearData}
                                className="flex items-center gap-2 px-3 py-2 text-white bg-red-500 font-bold border-2 border-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm rounded-none"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear
                            </button>
                            <div className="text-right">
                                <p className="text-sm font-bold text-black">AI Credits</p>
                                <p className="text-2xl font-extrabold text-primary">{aiCredits}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="order-2 md:order-1 space-y-6">
                            <button
                                onClick={() => onNavigate('sections')}
                                className="flex items-center gap-2 text-primary hover:text-blue-700 font-bold mb-4"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Back to Sections
                            </button>

                            {sections.find(s => s.id === 'personal' && s.enabled) && (
                                <div className="bg-white border-4 border-black shadow-neo p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <h2 className="text-xl text-black font-bold">Personal Info</h2>
                                        <Tooltip id="personal-info" text="Your contact information. Use professional details that employers can use to reach you." />
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center gap-1 mb-1">
                                                <label className="text-sm font-bold text-black">Full Name</label>
                                                <Tooltip id="name-tip" text="Use your full name as it appears on official documents" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="John Doe"
                                                value={cvData.personal.name}
                                                onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, name: e.target.value } })}
                                                className="w-full px-4 py-2 border-2 border-black rounded-none focus:outline-none focus:shadow-neo-sm transition-all"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1 mb-1">
                                                <label className="text-sm font-bold text-black">Email</label>
                                                <Tooltip id="email-tip" text="Use a professional email address" />
                                            </div>
                                            <input
                                                type="email"
                                                placeholder="john.doe@email.com"
                                                value={cvData.personal.email}
                                                onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, email: e.target.value } })}
                                                className="w-full px-4 py-2 border-2 border-black rounded-none focus:outline-none focus:shadow-neo-sm transition-all"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1 mb-1">
                                                <label className="text-sm font-bold text-black">Phone</label>
                                                <Tooltip id="phone-tip" text="Include country code for international applications" />
                                            </div>
                                            <input
                                                type="tel"
                                                placeholder="+62 812-3456-7890"
                                                value={cvData.personal.phone}
                                                onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, phone: e.target.value } })}
                                                className="w-full px-4 py-2 border-2 border-black rounded-none focus:outline-none focus:shadow-neo-sm transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-black block mb-1">Location</label>
                                            <input
                                                type="text"
                                                placeholder="Location (optional)"
                                                value={cvData.personal.location}
                                                onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, location: e.target.value } })}
                                                className="w-full px-4 py-2 border-2 border-black rounded-none focus:outline-none focus:shadow-neo-sm transition-all"
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <div className="flex items-center gap-1 mb-2">
                                                <label className="text-sm font-bold text-black">Custom Fields</label>
                                                <Tooltip id="custom-tip" text="Add LinkedIn, GitHub, Portfolio, or other professional links" />
                                            </div>
                                            {cvData.personal.customFields.map((field, idx) => (
                                                <div key={idx} className="flex gap-2 mb-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Label"
                                                        value={field.label}
                                                        onChange={(e) => {
                                                            const newFields = [...cvData.personal.customFields];
                                                            newFields[idx].label = e.target.value;
                                                            setCvData({ ...cvData, personal: { ...cvData.personal, customFields: newFields } });
                                                        }}
                                                        className="w-1/3 px-4 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Value"
                                                        value={field.value}
                                                        onChange={(e) => {
                                                            const newFields = [...cvData.personal.customFields];
                                                            newFields[idx].value = e.target.value;
                                                            setCvData({ ...cvData, personal: { ...cvData.personal, customFields: newFields } });
                                                        }}
                                                        className="flex-1 px-4 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newFields = cvData.personal.customFields.filter((f, i) => i !== idx);
                                                            setCvData({ ...cvData, personal: { ...cvData.personal, customFields: newFields } });
                                                        }}
                                                        className="text-red-500 font-bold border-2 border-transparent hover:border-black p-1"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}

                                            {cvData.personal.customFields.length < 2 && (
                                                <button
                                                    onClick={() => {
                                                        setCvData({
                                                            ...cvData,
                                                            personal: {
                                                                ...cvData.personal,
                                                                customFields: [...cvData.personal.customFields, { label: '', value: '' }]
                                                            }
                                                        });
                                                    }}
                                                    className="text-primary hover:text-blue-700 text-sm font-bold"
                                                >
                                                    + Add Custom Field
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {sections.find(s => s.id === 'summary' && s.enabled) && (
                                <div className="bg-white border-4 border-black shadow-neo p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl text-black font-bold">Summary</h2>
                                            <Tooltip id="summary-tip" text="Keep it brief - 2-3 sentences highlighting your strengths and goals" />
                                        </div>
                                        <span className={`text-sm font-bold ${cvData.summary.length > 500 ? 'text-red-600' : cvData.summary.length > 400 ? 'text-yellow-600' : 'text-gray-500'}`}>
                                            {cvData.summary.length}/500
                                        </span>
                                    </div>
                                    <textarea
                                        placeholder="e.g., Experienced software engineer with 5+ years building scalable web applications..."
                                        value={cvData.summary}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 500) {
                                                setCvData({ ...cvData, summary: e.target.value });
                                            }
                                        }}
                                        rows={4}
                                        className="w-full px-4 py-2 border-2 border-black rounded-none focus:outline-none focus:shadow-neo-sm transition-all"
                                    />
                                </div>
                            )}

                            {sections.find(s => s.id === 'experience' && s.enabled) && (
                                <div className="bg-white border-4 border-black shadow-neo p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <h2 className="text-xl text-gray-900 font-semibold">Experience</h2>
                                        <Tooltip id="exp-tip" text="List work experience in reverse chronological order. Use bullet points and quantify achievements." />
                                    </div>
                                    <div className="space-y-4">
                                        {cvData.experience.map((exp, idx) => (
                                            <div
                                                key={idx}
                                                draggable
                                                onDragStart={() => {
                                                    setDraggedItem(idx);
                                                    setDraggedItemType('experience');
                                                }}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={() => {
                                                    if (draggedItem === null || draggedItemType !== 'experience') return;
                                                    const newExp = [...cvData.experience];
                                                    const [removed] = newExp.splice(draggedItem, 1);
                                                    newExp.splice(idx, 0, removed);
                                                    setCvData({ ...cvData, experience: newExp });
                                                    setDraggedItem(null);
                                                    setDraggedItemType(null);
                                                }}
                                                className="p-4 border-2 border-black space-y-3 cursor-move hover:shadow-neo-sm transition-all"
                                            >
                                                <div className="flex gap-2">
                                                    <GripVertical className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
                                                    <div className="flex-1 space-y-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Job Title"
                                                            value={exp.title}
                                                            onChange={(e) => {
                                                                const newExp = [...cvData.experience];
                                                                newExp[idx].title = e.target.value;
                                                                setCvData({ ...cvData, experience: newExp });
                                                            }}
                                                            className="w-full px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Company"
                                                            value={exp.company}
                                                            onChange={(e) => {
                                                                const newExp = [...cvData.experience];
                                                                newExp[idx].company = e.target.value;
                                                                setCvData({ ...cvData, experience: newExp });
                                                            }}
                                                            className="w-full px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                        />
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input
                                                                type="month"
                                                                value={exp.startDate}
                                                                onChange={(e) => {
                                                                    const newExp = [...cvData.experience];
                                                                    newExp[idx].startDate = e.target.value;
                                                                    setCvData({ ...cvData, experience: newExp });
                                                                }}
                                                                className="px-3 py-2 border-2 border-black rounded-none text-sm bg-white focus:outline-none focus:shadow-neo-sm"
                                                            />
                                                            <input
                                                                type="month"
                                                                value={exp.endDate}
                                                                onChange={(e) => {
                                                                    const newExp = [...cvData.experience];
                                                                    newExp[idx].endDate = e.target.value;
                                                                    setCvData({ ...cvData, experience: newExp });
                                                                }}
                                                                disabled={exp.current}
                                                                className="px-3 py-2 border-2 border-black rounded-none text-sm bg-white focus:outline-none focus:shadow-neo-sm"
                                                            />
                                                        </div>
                                                        <label className="flex items-center gap-2 text-sm text-gray-600">
                                                            <input
                                                                type="checkbox"
                                                                checked={exp.current}
                                                                onChange={(e) => {
                                                                    const newExp = [...cvData.experience];
                                                                    newExp[idx].current = e.target.checked;
                                                                    if (e.target.checked) newExp[idx].endDate = '';
                                                                    setCvData({ ...cvData, experience: newExp });
                                                                }}
                                                            />
                                                            Currently working here
                                                        </label>
                                                        <textarea
                                                            placeholder="Description..."
                                                            value={exp.description}
                                                            onChange={(e) => {
                                                                const newExp = [...cvData.experience];
                                                                newExp[idx].description = e.target.value;
                                                                setCvData({ ...cvData, experience: newExp });
                                                            }}
                                                            rows={3}
                                                            className="w-full px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => setCvData({ ...cvData, experience: cvData.experience.filter((f, i) => i !== idx) })}
                                                        className="text-red-500"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setCvData({ ...cvData, experience: [...cvData.experience, { title: '', company: '', startDate: '', endDate: '', description: '', current: false }] })}
                                            className="w-full p-3 border-2 border-dashed border-black rounded-none hover:bg-primary hover:text-white hover:border-solid hover:shadow-neo-sm transition-all font-bold text-black"
                                        >
                                            <Plus className="w-4 h-4 inline mr-2" />
                                            Add Experience
                                        </button>
                                    </div>
                                </div>
                            )}

                            {sections.find(s => s.id === 'education' && s.enabled) && (
                                <div className="bg-white border-4 border-black shadow-neo p-6">
                                    <h2 className="text-xl text-gray-900 font-semibold mb-4">Education</h2>
                                    <div className="space-y-4">
                                        {cvData.education.map((edu, idx) => (
                                            <div
                                                key={idx}
                                                draggable
                                                onDragStart={() => {
                                                    setDraggedItem(idx);
                                                    setDraggedItemType('education');
                                                }}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={() => {
                                                    if (draggedItem === null || draggedItemType !== 'education') return;
                                                    const newEdu = [...cvData.education];
                                                    const [removed] = newEdu.splice(draggedItem, 1);
                                                    newEdu.splice(idx, 0, removed);
                                                    setCvData({ ...cvData, education: newEdu });
                                                    setDraggedItem(null);
                                                    setDraggedItemType(null);
                                                }}
                                                className="p-4 border-2 border-black space-y-3 cursor-move hover:shadow-neo-sm transition-all"
                                            >
                                                <div className="flex gap-2">
                                                    <GripVertical className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
                                                    <div className="flex-1 space-y-3">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <select
                                                                value={edu.degree}
                                                                onChange={(e) => {
                                                                    const newEdu = [...cvData.education];
                                                                    newEdu[idx].degree = e.target.value;
                                                                    setCvData({ ...cvData, education: newEdu });
                                                                }}
                                                                className="px-3 py-2 border rounded text-sm bg-white"
                                                            >
                                                                <option value="">Select Degree</option>
                                                                <option value="High School">High School</option>
                                                                <option value="Associate Degree">Associate</option>
                                                                <option value="Bachelor's Degree">Bachelor's</option>
                                                                <option value="Master's Degree">Master's</option>
                                                                <option value="Doctorate (PhD)">PhD</option>
                                                            </select>
                                                            <input
                                                                type="text"
                                                                placeholder="Major"
                                                                value={edu.major}
                                                                onChange={(e) => {
                                                                    const newEdu = [...cvData.education];
                                                                    newEdu[idx].major = e.target.value;
                                                                    setCvData({ ...cvData, education: newEdu });
                                                                }}
                                                                className="px-3 py-2 border-2 border-black rounded-none text-sm bg-white focus:outline-none focus:shadow-neo-sm"
                                                            />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Institution"
                                                            value={edu.institution}
                                                            onChange={(e) => {
                                                                const newEdu = [...cvData.education];
                                                                newEdu[idx].institution = e.target.value;
                                                                setCvData({ ...cvData, education: newEdu });
                                                            }}
                                                            className="w-full px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                        />
                                                        <input
                                                            type="month"
                                                            value={edu.year}
                                                            onChange={(e) => {
                                                                const newEdu = [...cvData.education];
                                                                newEdu[idx].year = e.target.value;
                                                                setCvData({ ...cvData, education: newEdu });
                                                            }}
                                                            className="w-full px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => setCvData({ ...cvData, education: cvData.education.filter((f, i) => i !== idx) })}
                                                        className="text-red-500"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setCvData({ ...cvData, education: [...cvData.education, { degree: '', major: '', institution: '', year: '' }] })}
                                            className="w-full p-3 border-2 border-dashed border-black rounded-none hover:bg-primary hover:text-white hover:border-solid hover:shadow-neo-sm transition-all font-bold text-black"
                                        >
                                            <Plus className="w-4 h-4 inline mr-2" />
                                            Add Education
                                        </button>
                                    </div>
                                </div>
                            )}

                            {sections.find(s => s.id === 'skills' && s.enabled) && (
                                <div className="bg-white border-4 border-black shadow-neo p-6">
                                    <h2 className="text-xl text-gray-900 font-semibold mb-4">Skills</h2>
                                    <div className="space-y-3">
                                        {cvData.skills.map((skill, idx) => (
                                            <div
                                                key={idx}
                                                draggable
                                                onDragStart={() => {
                                                    setDraggedItem(idx);
                                                    setDraggedItemType('skills');
                                                }}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={() => {
                                                    if (draggedItem === null || draggedItemType !== 'skills') return;
                                                    const newSkills = [...cvData.skills];
                                                    const [removed] = newSkills.splice(draggedItem, 1);
                                                    newSkills.splice(idx, 0, removed);
                                                    setCvData({ ...cvData, skills: newSkills });
                                                    setDraggedItem(null);
                                                    setDraggedItemType(null);
                                                }}
                                                className="flex gap-2 cursor-move hover:shadow-neo-sm p-2 border-2 border-transparent hover:border-black transition-all"
                                            >
                                                <GripVertical className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
                                                <input
                                                    type="text"
                                                    placeholder="Skill"
                                                    value={skill}
                                                    onChange={(e) => {
                                                        const newSkills = [...cvData.skills];
                                                        newSkills[idx] = e.target.value;
                                                        setCvData({ ...cvData, skills: newSkills });
                                                    }}
                                                    className="flex-1 px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                />
                                                <button
                                                    onClick={() => setCvData({ ...cvData, skills: cvData.skills.filter((f, i) => i !== idx) })}
                                                    className="text-red-500"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setCvData({ ...cvData, skills: [...cvData.skills, ''] })}
                                            className="w-full p-3 border-2 border-dashed border-black rounded-none hover:bg-primary hover:text-white hover:border-solid hover:shadow-neo-sm transition-all font-bold text-black"
                                        >
                                            <Plus className="w-4 h-4 inline mr-2" />
                                            Add Skill
                                        </button>
                                    </div>
                                </div>
                            )}

                            {sections.find(s => s.id === 'certification' && s.enabled) && (
                                <div className="bg-white border-4 border-black shadow-neo p-6">
                                    <h2 className="text-xl font-semibold mb-4">Certifications</h2>
                                    <div className="space-y-3">
                                        {cvData.certification.map((cert, idx) => (
                                            <div
                                                key={idx}
                                                draggable
                                                onDragStart={() => {
                                                    setDraggedItem(idx);
                                                    setDraggedItemType('certification');
                                                }}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={() => {
                                                    if (draggedItem === null || draggedItemType !== 'certification') return;
                                                    const newCert = [...cvData.certification];
                                                    const [removed] = newCert.splice(draggedItem, 1);
                                                    newCert.splice(idx, 0, removed);
                                                    setCvData({ ...cvData, certification: newCert });
                                                    setDraggedItem(null);
                                                    setDraggedItemType(null);
                                                }}
                                                className="flex gap-2 cursor-move hover:shadow-neo-sm p-2 border-2 border-transparent hover:border-black transition-all"
                                            >
                                                <GripVertical className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
                                                <input
                                                    type="text"
                                                    placeholder="Certification"
                                                    value={cert}
                                                    onChange={(e) => {
                                                        const newCert = [...cvData.certification];
                                                        newCert[idx] = e.target.value;
                                                        setCvData({ ...cvData, certification: newCert });
                                                    }}
                                                    className="flex-1 px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                />
                                                <button
                                                    onClick={() => setCvData({ ...cvData, certification: cvData.certification.filter((f, i) => i !== idx) })}
                                                    className="text-red-500"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setCvData({ ...cvData, certification: [...cvData.certification, ''] })}
                                            className="w-full p-3 border-2 border-dashed border-black rounded-none hover:bg-primary hover:text-white hover:border-solid hover:shadow-neo-sm transition-all font-bold text-black"
                                        >
                                            <Plus className="w-4 h-4 inline mr-2" />
                                            Add Certification
                                        </button>
                                    </div>
                                </div>
                            )}

                            {sections.find(s => s.id === 'language' && s.enabled) && (
                                <div className="bg-white border-4 border-black shadow-neo p-6">
                                    <h2 className="text-xl font-semibold mb-4">Languages</h2>
                                    <div className="space-y-3">
                                        {cvData.language.map((lang, idx) => (
                                            <div
                                                key={idx}
                                                draggable
                                                onDragStart={() => {
                                                    setDraggedItem(idx);
                                                    setDraggedItemType('language');
                                                }}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={() => {
                                                    if (draggedItem === null || draggedItemType !== 'language') return;
                                                    const newLang = [...cvData.language];
                                                    const [removed] = newLang.splice(draggedItem, 1);
                                                    newLang.splice(idx, 0, removed);
                                                    setCvData({ ...cvData, language: newLang });
                                                    setDraggedItem(null);
                                                    setDraggedItemType(null);
                                                }}
                                                className="flex gap-2 cursor-move hover:shadow-neo-sm p-2 border-2 border-transparent hover:border-black transition-all"
                                            >
                                                <GripVertical className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
                                                <input
                                                    type="text"
                                                    placeholder="Language"
                                                    value={lang}
                                                    onChange={(e) => {
                                                        const newLang = [...cvData.language];
                                                        newLang[idx] = e.target.value;
                                                        setCvData({ ...cvData, language: newLang });
                                                    }}
                                                    className="flex-1 px-3 py-2 border-2 border-black rounded-none text-sm focus:outline-none focus:shadow-neo-sm"
                                                />
                                                <button
                                                    onClick={() => setCvData({ ...cvData, language: cvData.language.filter((f, i) => i !== idx) })}
                                                    className="text-red-500"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setCvData({ ...cvData, language: [...cvData.language, ''] })}
                                            className="w-full p-3 border-2 border-dashed border-black rounded-none hover:bg-primary hover:text-white hover:border-solid hover:shadow-neo-sm transition-all font-bold text-black"
                                        >
                                            <Plus className="w-4 h-4 inline mr-2" />
                                            Add Language
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white border-4 border-black shadow-neo p-6">
                                <div className="space-y-3">
                                    <button
                                        onClick={() => alert('AI Suggestion features would be implemented here')}
                                        className="w-full p-4 bg-purple-500 text-white border-2 border-black shadow-neo-sm rounded-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold flex items-center justify-center gap-2"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        Use AI Suggestions ({aiCredits} credits)
                                    </button>
                                    <button
                                        onClick={downloadPDF}
                                        className="w-full p-4 bg-primary text-white border-2 border-black shadow-neo-sm rounded-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download PDF
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 md:order-2 md:sticky md:top-8 md:h-fit">
                            <div className="bg-white border-4 border-black shadow-neo p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl text-black font-semibold">Live Preview</h2>
                                    <select
                                        value={selectedTemplate || 'minimal'}
                                        onChange={(e) => setSelectedTemplate(e.target.value)}
                                        className="px-3 py-1 border-2 border-black rounded-none text-sm text-black font-bold focus:shadow-neo-sm outline-none"
                                    >
                                        {templates.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="border-2 border-black bg-white overflow-auto" style={{ height: '700px' }}>
                                    <div id="cv-preview-for-pdf">
                                        <CVPreview cvData={cvData} sections={sections} selectedTemplate={selectedTemplate} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
