const fs = require('fs');

let content = fs.readFileSync('components/Fill.tsx', 'utf8');

// 1. imports
content = content.replace(
  "import { motion, AnimatePresence } from 'framer-motion';",
  "import { motion, AnimatePresence, Reorder } from 'framer-motion';"
);

// 2. remove drag state
content = content.replace(
  /const \[draggedItem, setDraggedItem\] = useState<number \| null>\(null\);\s*const \[draggedItemType, setDraggedItemType\] = useState<string \| null>\(null\);/g,
  ""
);

// Helper for Reorder Group replacement
function replaceList(section) {
  // We need to find the AnimatePresence block for this section
  const isObjectList = ['experience', 'education', 'projects', 'customFields'].includes(section);
  const isStringList = ['skills', 'certification', 'language'].includes(section);
  
  if (isStringList) {
    // 1. replace Add button
    content = content.replace(
      new RegExp(`onClick=\\{\\(\\) => setCvData\\(\\{ \\.\\.\\.cvData, ${section}: \\[\.\\.\\.cvData\\.${section}, ''\\] \\}\\)\\}`, 'g'),
      `onClick={() => setCvData({ ...cvData, ${section}: [...cvData.${section}, { id: crypto.randomUUID(), value: '' }] })}`
    );
    // 2. replace input value and onChange
    const singular = section === 'certification' ? 'cert' : section === 'language' ? 'lang' : 'skill';
    content = content.replace(
      new RegExp(`value=\\{${singular}\\}`, 'g'),
      `value={${singular}.value}`
    );
    content = content.replace(
      new RegExp(`new${section.charAt(0).toUpperCase() + section.slice(1)}\\[idx\\] = e.target.value;`, 'g'),
      `new${section.charAt(0).toUpperCase() + section.slice(1)}[idx] = { ...new${section.charAt(0).toUpperCase() + section.slice(1)}[idx], value: e.target.value };`
    );
  }

  // 3. replace draggable div with Reorder
  if (section !== 'customFields') {
    const listMap = section;
    const itemVar = isStringList ? (section === 'certification' ? 'cert' : section === 'language' ? 'lang' : 'skill') : (section === 'experience' ? 'exp' : section === 'education' ? 'edu' : section === 'projects' ? 'project' : 'item');
    
    // Find the AnimatePresence block
    const mapRegex = new RegExp(`<AnimatePresence initial=\\{false\\}>[\\s\\S]*?\\{cvData\\.${section}\\.map\\(\\(${itemVar}, idx\\) => \\([\\s\\S]*?<motion\\.div[\\s\\S]*?key=\\{idx\\}[\\s\\S]*?draggable[\\s\\S]*?onDragStart=\\{[\\s\\S]*?\\}[\\s\\S]*?onDragOver=\\{[\\s\\S]*?\\}[\\s\\S]*?onDrop=\\{[\\s\\S]*?\\}[\\s\\S]*?className="([^"]+)"[\\s\\S]*?>`, 'g');
    
    content = content.replace(mapRegex, (match, className) => {
      // Modify className cursor
      const newClassName = className.replace('cursor-move', 'cursor-grab active:cursor-grabbing bg-white relative');
      
      return `<Reorder.Group axis="y" values={cvData.${section}} onReorder={(reordered) => setCvData({ ...cvData, ${section}: reordered })} className="${isStringList ? 'space-y-3' : 'space-y-4'}">\n` +
             `                                        <AnimatePresence initial={false}>\n` +
             `                                        {cvData.${section}.map((${itemVar}, idx) => (\n` +
             `                                            <Reorder.Item\n` +
             `                                                key={${itemVar}.id || idx}\n` +
             `                                                value={${itemVar}}\n` +
             `                                                initial={{ opacity: 0, y: ${isStringList ? '12' : '16'} }}\n` +
             `                                                animate={{ opacity: 1, y: 0 }}\n` +
             `                                                exit={{ opacity: 0, y: ${isStringList ? '-6' : '-8'}, transition: { duration: 0.15 } }}\n` +
             `                                                transition={{ type: 'spring', stiffness: 300, damping: 24 }}\n` +
             `                                                className="${newClassName}"\n` +
             `                                            >`;
    });

    // Close Reorder.Group
    // Since we replaced motion.div with Reorder.Item, we need to replace </motion.div> with </Reorder.Item>
    // But only inside this map!
    // We can just replace all </motion.div> to </Reorder.Item> for this whole block. The block ends with </AnimatePresence>
    // We can do it globally since only the ones inside AnimatePresence maps use </motion.div>.
    // Wait, customFields has motion.div, we have to be careful.
  }
}

// Just apply to the lists
['experience', 'education', 'skills', 'projects', 'certification', 'language'].forEach(replaceList);

// Replace closing tags for Reorder instead of motion.div where needed.
// We can use a regex to find </motion.div> directly preceding ))} </AnimatePresence> for the lists.
content = content.replace(
    /<\/motion\.div>\s*\)\)}\s*<\/AnimatePresence>/g, 
    "</Reorder.Item>\n                                        ))}\n                                        </AnimatePresence>\n                                        </Reorder.Group>"
);

// We still need to handle customFields Reorder? The plan says:
// "Sections needing Reorder: experience, education, skills, projects, certification, language, customFields (7 total)."
// Let's add Reorder for customFields
content = content.replace(
    /<AnimatePresence initial=\{false\}>\s*\{cvData\.personal\.customFields\.map\(\(field, idx\) => \(\s*<motion\.div\s*key=\{idx\}\s*initial=\{\{ opacity: 0, y: 12 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*exit=\{\{ opacity: 0, y: -8, transition: \{ duration: 0.15 \} \}\}\s*transition=\{\{ type: 'spring', stiffness: 300, damping: 24 \}\}\s*className="mb-2"\s*>/g,
    `<Reorder.Group axis="y" values={cvData.personal.customFields} onReorder={(reordered) => setCvData({ ...cvData, personal: { ...cvData.personal, customFields: reordered } })} className="space-y-2">\n` +
    `                                            <AnimatePresence initial={false}>\n` +
    `                                            {cvData.personal.customFields.map((field, idx) => (\n` +
    `                                                <Reorder.Item\n` +
    `                                                    key={field.id || idx}\n` +
    `                                                    value={field}\n` +
    `                                                    initial={{ opacity: 0, y: 12 }}\n` +
    `                                                    animate={{ opacity: 1, y: 0 }}\n` +
    `                                                    exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}\n` +
    `                                                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}\n` +
    `                                                    className="mb-2 bg-white relative block"\n` +
    `                                                >\n` +
    `                                                    {/* Added drag handle for custom fields */}\n` +
    `                                                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500">\n` +
    `                                                        <GripVertical className="w-4 h-4" />\n` +
    `                                                    </div>`
);

// Now fix customFields closing
content = content.replace(
    /<\/motion\.div>\s*\)\)}\s*<\/AnimatePresence>\s*<button/g,
    "</Reorder.Item>\n                                            ))}\n                                            </AnimatePresence>\n                                            </Reorder.Group>\n                                            <button"
);

// Fix the GripVertical cursor classes across all lists
content = content.replace(/<GripVertical className="([^"]+)" \/>/g, (match, p1) => {
    if (p1.includes('w-5 h-5 text-gray-400 mt-2 flex-shrink-0') && !p1.includes('cursor-grab')) {
        return `<GripVertical className="${p1} cursor-grab active:cursor-grabbing hover:text-gray-600" />`;
    }
    return match;
});

// For skills/cert/lang, we had cvData.skills.filter((f, i) => i !== idx), we need to replace f with _
content = content.replace(/cvData\.skills\.filter\(\(f, i\) => i !== idx\)/g, "cvData.skills.filter((_, i) => i !== idx)");
content = content.replace(/cvData\.certification\.filter\(\(f, i\) => i !== idx\)/g, "cvData.certification.filter((_, i) => i !== idx)");
content = content.replace(/cvData\.language\.filter\(\(f, i\) => i !== idx\)/g, "cvData.language.filter((_, i) => i !== idx)");

fs.writeFileSync('components/Fill.tsx', content);
console.log('Fill.tsx patched');
