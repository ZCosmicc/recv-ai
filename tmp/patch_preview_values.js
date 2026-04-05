const fs = require('fs');
const path = 'components/CVPreview.tsx';

let content = fs.readFileSync(path, 'utf8');

// Replace the specific properties back since the array map handles the extraction now
content = content.replace(/\{cert\.value\}/g, "{cert}");
content = content.replace(/\{skill\.value\}/g, "{skill}");
content = content.replace(/\{lang\.value\}/g, "{lang}");

fs.writeFileSync(path, content);
console.log('Fixed CVPreview value access');
