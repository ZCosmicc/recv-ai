import sys

with open('c:/Users/Nameless/cv-ats-builder/components/CVPagedContent.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.strip().startswith('export type TemplateName = '):
        new_lines.append('export type TemplateName = \'minimal\' | \'modern\' | \'creative\' | \'corporate\' | \'executive\' | \'syntax\' | \'syntax-nano\';\n')
        continue
        
    if line.strip() == 'import { CVData, Section } from \'../types\';':
        new_lines.append(line)
        new_lines.append('import { Mail, Phone, MapPin, Link as LinkIcon, Check } from \'lucide-react\';\n')
        continue

    if line.strip() == 'executive: 474,':
        new_lines.append(line)
        new_lines.append('    syntax: 714,\n    \'syntax-nano\': 714,\n')
        continue
        
    if line.strip() == 'executive: 1059,':
        new_lines.append(line)
        new_lines.append('    syntax: 1043,\n    \'syntax-nano\': 1043,\n')
        continue
        
    if line.strip() == 'if (template === \'minimal\') return (' and 'SectionSummary' in ''.join(new_lines[-15:]):
        new_lines.append('    if (template === \'syntax\') return (\n        <div className=\"grid grid-cols-[1fr_3fr] gap-4 mb-4 font-geist\">\n            <h2 className=\"text-[10px] font-bold uppercase tracking-widest text-gray-400\">Summary</h2>\n            <p className={`text-xs leading-relaxed text-gray-800 ${getHL(\'summary\', hp, sp)}`}>{cvData.summary}</p>\n        </div>\n    );\n    if (template === \'syntax-nano\') return (\n        <div className=\"mb-4 font-jetbrains\">\n            <h2 className=\"text-xs font-bold uppercase mb-2 border-b-2 border-gray-900 pb-1\">Summary</h2>\n            <p className={`text-xs leading-relaxed text-gray-800 ${getHL(\'summary\', hp, sp)}`}>{cvData.summary}</p>\n        </div>\n    );\n')
    elif line.strip() == 'if (template === \'minimal\') return (' and 'SectionExperience' in ''.join(new_lines[-15:]):
        new_lines.append('''    if (template === 'syntax') return (
        <div className="grid grid-cols-[1fr_3fr] gap-4 mb-4 font-geist">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Experience</h2>
            <div className="space-y-4">
                {cvData.experience.map((exp, i) => (
                    <div key={i}>
                        <div className="flex justify-between items-baseline mb-1">
                            {exp.title && <h3 className={`font-bold text-xs ${getHL(`experience[${i}].title`, hp, sp)}`}>{exp.title}</h3>}
                            {(exp.startDate || exp.endDate || exp.current) && (
                                <p className="text-gray-500 text-[10px]">
                                    <span className={getHL(`experience[${i}].startDate`, hp, sp)}>{exp.startDate ? fmt(exp.startDate) : ''}</span>
                                    {' - '}
                                    <span className={getHL(`experience[${i}].endDate`, hp, sp)}>{exp.current ? 'Present' : (exp.endDate ? fmt(exp.endDate) : '')}</span>
                                </p>
                            )}
                        </div>
                        {exp.company && <p className={`text-gray-600 text-xs mb-1 ${getHL(`experience[${i}].company`, hp, sp)}`}>{exp.company}</p>}
                        {exp.description && <DescriptionText text={exp.description} className={`text-gray-700 ${getHL(`experience[${i}].description`, hp, sp)}`} />}
                    </div>
                ))}
            </div>
        </div>
    );
    if (template === 'syntax-nano') return (
        <div className="mb-4 font-jetbrains">
            <h2 className="text-xs font-bold uppercase mb-2 border-b-2 border-gray-900 pb-1">Experience</h2>
            <div className="space-y-3">
                {cvData.experience.map((exp, i) => (
                    <div key={i}>
                        <div className="flex justify-between items-baseline mb-0.5">
                            {exp.title && <h3 className={`font-bold text-xs ${getHL(`experience[${i}].title`, hp, sp)}`}>{exp.title} <span className="font-normal text-gray-600">@ {exp.company}</span></h3>}
                            {(exp.startDate || exp.endDate || exp.current) && (
                                <p className="text-gray-500 text-[10px]">
                                    <span className={getHL(`experience[${i}].startDate`, hp, sp)}>{exp.startDate ? fmt(exp.startDate) : ''}</span>
                                    {' - '}
                                    <span className={getHL(`experience[${i}].endDate`, hp, sp)}>{exp.current ? 'Present' : (exp.endDate ? fmt(exp.endDate) : '')}</span>
                                </p>
                            )}
                        </div>
                        {exp.description && <DescriptionText text={exp.description} className={`pl-3 border-l text-gray-700 ${getHL(`experience[${i}].description`, hp, sp)}`} />}
                    </div>
                ))}
            </div>
        </div>
    );\n''')
    elif line.strip() == 'if (template === \'minimal\') return (' and 'SectionEducation' in ''.join(new_lines[-15:]):
        new_lines.append('''    if (template === 'syntax') return (
        <div className="grid grid-cols-[1fr_3fr] gap-4 mb-4 font-geist">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Education</h2>
            <div className="space-y-3">
                {cvData.education.map((edu, i) => (
                    <div key={i} className="flex justify-between items-baseline">
                        <div>
                            {edu.degree && <h3 className={`font-bold text-xs ${getHL(`education[${i}].degree`, hp, sp)}`}>{edu.degree}{edu.major && <span className={getHL(`education[${i}].major`, hp, sp)}>{` in ${edu.major}`}</span>}</h3>}
                            {edu.institution && <p className={`text-gray-600 text-[10px] ${getHL(`education[${i}].institution`, hp, sp)}`}>{edu.institution}</p>}
                        </div>
                        {edu.year && <p className={`text-gray-500 text-[10px] ${getHL(`education[${i}].year`, hp, sp)}`}>{fmt(edu.year)}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
    if (template === 'syntax-nano') return (
        <div className="mb-4 font-jetbrains">
            <h2 className="text-xs font-bold uppercase mb-2 border-b-2 border-gray-900 pb-1">Education</h2>
            <div className="space-y-2">
                {cvData.education.map((edu, i) => (
                    <div key={i} className="flex justify-between items-baseline">
                        <div>
                            {edu.degree && <h3 className={`font-bold text-xs ${getHL(`education[${i}].degree`, hp, sp)}`}>{edu.degree}{edu.major && <span className={getHL(`education[${i}].major`, hp, sp)}>{` - ${edu.major}`}</span>}</h3>}
                            {edu.institution && <p className={`text-gray-600 text-[10px] ${getHL(`education[${i}].institution`, hp, sp)}`}>{edu.institution}</p>}
                        </div>
                        {edu.year && <p className={`text-gray-500 text-[10px] ${getHL(`education[${i}].year`, hp, sp)}`}>{fmt(edu.year)}</p>}
                    </div>
                ))}
            </div>
        </div>
    );\n''')
    elif line.strip() == 'if (template === \'minimal\') return (' and 'SectionSkills' in ''.join(new_lines[-15:]):
        new_lines.append('''    if (template === 'syntax') return (
        <div className="grid grid-cols-[1fr_3fr] gap-4 mb-4 font-geist">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Skills</h2>
            <div className="flex flex-wrap gap-1 text-xs text-gray-800">
                {cvData.skills.map(s => typeof s === 'string' ? s : s.value).filter(v => v && v.trim()).map((skill, i) => (
                    <span key={i} className={`px-1.5 py-0.5 bg-gray-100 rounded-sm leading-none border border-gray-200 ${getHL(`skills[${i}].value`, hp, sp)}`}>{skill}</span>
                ))}
            </div>
        </div>
    );
    if (template === 'syntax-nano') return (
        <div className="mb-4 font-jetbrains">
            <h2 className="text-xs font-bold uppercase mb-2 border-b-2 border-gray-900 pb-1">Skills</h2>
            <p className="text-xs text-gray-800 leading-relaxed">
                {cvData.skills.map(s => typeof s === 'string' ? s : s.value).filter(v => v && v.trim()).map((skill, i, arr) => (
                    <span key={i} className={getHL(`skills[${i}].value`, hp, sp)}>{skill}{i < arr.length - 1 ? ' • ' : ''}</span>
                ))}
            </p>
        </div>
    );\n''')
    elif line.strip() == 'if (template === \'minimal\') return (' and 'SectionProjects' in ''.join(new_lines[-15:]):
        new_lines.append('''    if (template === 'syntax') return (
        <div className="grid grid-cols-[1fr_3fr] gap-4 mb-4 font-geist">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Projects</h2>
            <div className="space-y-4">
                {projects.map((p, i) => (
                    <div key={i}>
                        <div className="flex justify-between items-baseline mb-0.5">
                            {p.title && <h3 className={`font-bold text-xs ${getHL(`projects[${i}].title`, hp, sp)}`}>{p.title}</h3>}
                            {p.technologies && <span className={`text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-sm border border-gray-200 ${getHL(`projects[${i}].technologies`, hp, sp)}`}>{p.technologies}</span>}
                        </div>
                        {p.description && <p className={`text-xs leading-relaxed text-gray-700 ${getHL(`projects[${i}].description`, hp, sp)}`}>{p.description}</p>}
                        {p.link && <p className={`flex items-center gap-1 text-gray-500 text-[10px] mt-1 ${getHL(`projects[${i}].link`, hp, sp)}`}><LinkIcon className="w-2.5 h-2.5 flex-shrink-0" /> {p.link}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
    if (template === 'syntax-nano') return (
        <div className="mb-4 font-jetbrains">
            <h2 className="text-xs font-bold uppercase mb-2 border-b-2 border-gray-900 pb-1">Projects</h2>
            <div className="space-y-3">
                {projects.map((p, i) => (
                    <div key={i}>
                        <div className="flex justify-between items-baseline mb-0.5">
                            {p.title && <h3 className={`font-bold text-xs ${getHL(`projects[${i}].title`, hp, sp)}`}>{p.title}</h3>}
                        </div>
                        {p.technologies && <p className={`text-[10px] text-gray-500 mb-0.5 ${getHL(`projects[${i}].technologies`, hp, sp)}`}>Built with: {p.technologies}</p>}
                        {p.description && <p className={`text-xs leading-relaxed text-gray-700 mb-0.5 ${getHL(`projects[${i}].description`, hp, sp)}`}>{p.description}</p>}
                        {p.link && <p className={`flex items-center gap-1 text-gray-500 text-[10px] ${getHL(`projects[${i}].link`, hp, sp)}`}><LinkIcon className="w-2.5 h-2.5 flex-shrink-0" /> {p.link}</p>}
                    </div>
                ))}
            </div>
        </div>
    );\n''')
    elif line.strip() == 'if (template === \'minimal\') return (' and 'SectionCertification' in ''.join(new_lines[-15:]):
        new_lines.append('''    if (template === 'syntax') return (
        <div className="grid grid-cols-[1fr_3fr] gap-4 mb-4 font-geist">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Certs</h2>
            <div className="flex flex-col gap-0.5 text-xs text-gray-800">
                {certs.map((c, i) => {
                    const val = typeof c === 'string' ? c : c.value;
                    if (!val || !val.trim()) return null;
                    return <div key={i} className={`flex items-start gap-1.5 ${getHL(`certification[${i}].value`, hp, sp)}`}><Check className="w-3 h-3 text-gray-400 flex-shrink-0" /> {val}</div>
                })}
            </div>
        </div>
    );
    if (template === 'syntax-nano') return (
        <div className="mb-4 font-jetbrains">
            <h2 className="text-xs font-bold uppercase mb-2 border-b-2 border-gray-900 pb-1">Certifications</h2>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-800">
                {certs.map((c, i) => {
                    const val = typeof c === 'string' ? c : c.value;
                    if (!val || !val.trim()) return null;
                    return <div key={i} className={`flex items-center gap-1 ${getHL(`certification[${i}].value`, hp, sp)}`}><span className="text-gray-400">›</span> {val}</div>
                })}
            </div>
        </div>
    );\n''')
    elif line.strip() == 'if (template === \'minimal\') return (' and 'SectionLanguage' in ''.join(new_lines[-15:]):
        new_lines.append('''    if (template === 'syntax') return (
        <div className="grid grid-cols-[1fr_3fr] gap-4 mb-4 font-geist">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Languages</h2>
            <div className="flex flex-wrap gap-1 text-xs text-gray-800">
                {langs.map((l, i) => {
                    const val = typeof l === 'string' ? l : l.value;
                    if (!val || !val.trim()) return null;
                    return <span key={i} className={`px-1.5 py-0.5 bg-gray-100 rounded-sm leading-none border border-gray-200 ${getHL(`language[${i}].value`, hp, sp)}`}>{val}</span>
                })}
            </div>
        </div>
    );
    if (template === 'syntax-nano') return (
        <div className="mb-4 font-jetbrains">
            <h2 className="text-xs font-bold uppercase mb-2 border-b-2 border-gray-900 pb-1">Languages</h2>
            <p className="text-xs text-gray-800 leading-relaxed">
                {langs.map((l, i, arr) => {
                    const val = typeof l === 'string' ? l : l.value;
                    if (!val || !val.trim()) return null;
                    return <span key={i} className={getHL(`language[${i}].value`, hp, sp)}>{val}{i < arr.length - 1 ? ' • ' : ''}</span>
                })}
            </p>
        </div>
    );\n''')
    elif line.strip() == 'if (template === \'minimal\') return (' and 'PersonalHeader' in ''.join(new_lines[-15:]):
        new_lines.append('''    if (template === 'syntax') return (
        <div className="grid grid-cols-[1fr_2fr] gap-4 mb-6 border-b-2 border-dashed border-gray-300 pb-4 font-geist">
            <div>
                <h1 className={`text-2xl font-bold uppercase tracking-tight ${getHL('personal.name', hp, sp)}`}>{p.name}</h1>
                <p className="text-gray-500 mt-1 uppercase tracking-widest text-[10px]">Professional Profile</p>
            </div>
            <div className="flex flex-col flex-wrap gap-1.5 text-[10px] self-end content-end">
                {p.email && <div className={`flex items-center gap-1.5 ${getHL('personal.email', hp, sp)}`}><Mail className="w-3 h-3 flex-shrink-0" /> {p.email}</div>}
                {p.phone && <div className={`flex items-center gap-1.5 ${getHL('personal.phone', hp, sp)}`}><Phone className="w-3 h-3 flex-shrink-0" /> {p.phone}</div>}
                {p.location && <div className={`flex items-center gap-1.5 ${getHL('personal.location', hp, sp)}`}><MapPin className="w-3 h-3 flex-shrink-0" /> {p.location}</div>}
                {p.customFields.map((f, i) => f.label && f.value && (
                    <div key={i} className={`flex items-center gap-1.5 ${getHL(`personal.customFields[${i}].value`, hp, sp)}`}><LinkIcon className="w-3 h-3 flex-shrink-0" /> {f.value}</div>
                ))}
            </div>
        </div>
    );
    if (template === 'syntax-nano') return (
        <div className="mb-4 font-jetbrains">
            <h1 className={`text-xl font-bold uppercase mb-1.5 ${getHL('personal.name', hp, sp)}`}>{p.name}</h1>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-600 mb-2">
                {p.email && <span className={`flex items-center gap-1 ${getHL('personal.email', hp, sp)}`}><Mail className="w-2.5 h-2.5 flex-shrink-0" /> {p.email}</span>}
                {p.phone && <span className={`flex items-center gap-1 ${getHL('personal.phone', hp, sp)}`}><Phone className="w-2.5 h-2.5 flex-shrink-0" /> {p.phone}</span>}
                {p.location && <span className={`flex items-center gap-1 ${getHL('personal.location', hp, sp)}`}><MapPin className="w-2.5 h-2.5 flex-shrink-0" /> {p.location}</span>}
                {p.customFields.map((f, i) => f.label && f.value && (
                    <span key={i} className={`flex items-center gap-1 ${getHL(`personal.customFields[${i}].value`, hp, sp)}`}><LinkIcon className="w-2.5 h-2.5 flex-shrink-0" /> {f.value}</span>
                ))}
            </div>
        </div>
    );\n''')

    new_lines.append(line)

with open('c:/Users/Nameless/cv-ats-builder/components/CVPagedContent.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
