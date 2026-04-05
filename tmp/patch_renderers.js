const fs = require('fs');

function patchFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Fix the array filters for the string-based object mapped types
    content = content.replace(/cvData\.skills\.filter\(s => s\.trim\(\)\)/g, "cvData.skills.filter(s => s.value.trim())");
    content = content.replace(/cvData\.certification\.filter\(c => c\.trim\(\)\)/g, "cvData.certification.filter(c => c.value.trim())");
    content = content.replace(/cvData\.language\.filter\(l => l\.trim\(\)\)/g, "cvData.language.filter(l => l.value.trim())");

    // 2. We need to replace the rendering of skill, cert, lang inside the map blocks.
    // Instead of doing regex on JSX, we can just replace {skill} with {skill.value}.
    // But wait, {skill} alone might be matched weirdly. 
    // In our templates, they are typically formatted like:
    // <span key={idx}>{skill}</span>
    // <p>{cert}</p>
    // {lang}
    content = content.replace(/>\{skill\}</g, ">{skill.value}<");
    content = content.replace(/>\{cert\}</g, ">{cert.value}<");
    content = content.replace(/>\{lang\}</g, ">{lang.value}<");
    
    // Some might be like `{skill}{idx < cvData.skills.length - 1 ? ' • ' : ''}`
    content = content.replace(/\{skill\}/g, "{skill.value}");
    content = content.replace(/\{cert\}/g, "{cert.value}");
    content = content.replace(/\{lang\}/g, "{lang.value}");
    
    // BUT we replaced `skill` entirely which could mess up `skill.value.value` if it matches again?
    // Let's do it carefully:
    // Revert what we just did and do it safely
    // Actually, `{skill}` is exact string match. It won't match `{skill.value}` because of the dot.
    
    fs.writeFileSync(filePath, content);
    console.log(filePath + ' patched');
}

// Safer approach:
function patchFileSafe(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(/cvData\.skills\.filter\(s => s\.trim\(\)\)/g, "cvData.skills.filter(s => s.value.trim())");
    content = content.replace(/cvData\.certification\.filter\(c => c\.trim\(\)\)/g, "cvData.certification.filter(c => c.value.trim())");
    content = content.replace(/cvData\.language\.filter\(l => l\.trim\(\)\)/g, "cvData.language.filter(l => l.value.trim())");

    // Replace strict block `{skill}` -> `{skill.value}`
    content = content.replace(/\{skill\}/g, "{skill.value}");
    content = content.replace(/\{cert\}/g, "{cert.value}");
    content = content.replace(/\{lang\}/g, "{lang.value}");

    // Wait, replacing `{skill}` also ruins `key={skill.id || idx}` if it exists, but there is no `id` yet in preview since it wasn't added.
    // Wait, `map((skill, idx)` -> we replaced `{skill}` not `skill.`. So `skill.value` won't be matched by `{skill}`.
    // What about `{skill.value}`? We might have just double-replaced it if I ran it twice. 
    fs.writeFileSync(filePath, content);
    console.log(filePath + ' patched safely');
}

patchFileSafe('components/CVPreview.tsx');
patchFileSafe('components/CVPagedContent.tsx');
