const fs = require('fs');

function fixRenderer(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix the array maps completely for skills, certification, and language
    
    // First, for cases where there's NO filter (e.g. CVPreview minimal/corporate might map directly):
    // Actually they also filter because empty strings shouldn't be rendered. Let's do a bulk replace first.
    
    // 1. Replace the previously added s.value.trim() back to s.trim() if we are extracting map first, 
    // OR we just prepend the map.
    
    // skills: cvData.skills.filter(s => s.value.trim()) -> cvData.skills.map(s => typeof s === 'string' ? s : s.value).filter(v => v.trim())
    content = content.replace(/cvData\.skills\.filter\(s => s\.value\.trim\(\)\)/g, "cvData.skills.map(s => typeof s === 'string' ? s : s.value).filter(v => v && v.trim())");
    
    content = content.replace(/cvData\.certification\.filter\(c => c\.value\.trim\(\)\)/g, "cvData.certification.map(c => typeof c === 'string' ? c : c.value).filter(v => v && v.trim())");
    
    content = content.replace(/cvData\.language\.filter\(l => l\.value\.trim\(\)\)/g, "cvData.language.map(l => typeof l === 'string' ? l : l.value).filter(v => v && v.trim())");

    fs.writeFileSync(filePath, content);
    console.log(filePath + ' fixed explicitly');
}

fixRenderer('components/CVPreview.tsx');
