import re

with open('components/Fill.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Custom Fields Add Button
content = content.replace(
    "const newFields = [...cvData.personal.customFields, { label: '', value: '' }];",
    "const newFields = [...cvData.personal.customFields, { id: crypto.randomUUID(), label: '', value: '' }];"
)

# Helpers for lists
sections = [
    ('experience', 'exp', False),
    ('education', 'edu', False),
    ('skills', 'skill', True),
    ('projects', 'project', False),
    ('certification', 'cert', True),
    ('language', 'lang', True)
]

for sec, var, is_string in sections:
    # Find the chunk starting from <AnimatePresence to </motion.div>
    start_str = f"{{cvData.{sec}.map(({var}, idx) => ("
    
    # Replace the starting wrapper and motion.div
    search_pattern = re.compile(
        r'<AnimatePresence initial=\{false\}>\s*\{cvData\.' + sec + r'\.map\(\(' + var + r', idx\) => \(\s*<motion\.div.*?className="([^"]+)"\s*>',
        re.DOTALL
    )
    
    def replacer(match):
        classes = match.group(1)
        classes = classes.replace('cursor-move', 'cursor-grab active:cursor-grabbing bg-white relative')
        y_val = '12' if is_string else '16'
        y_exit = '-6' if is_string else '-8'
        space_y = 'space-y-3' if is_string else 'space-y-4'
        
        return f"""<Reorder.Group axis="y" values={{cvData.{sec}}} onReorder={{(reordered) => setCvData({{ ...cvData, {sec}: reordered }})}} className="{space_y}">
                                        <AnimatePresence initial={{false}}>
                                        {{cvData.{sec}.map(({var}, idx) => (
                                            <Reorder.Item
                                                key={{{var}.id || idx}}
                                                value={{{var}}}
                                                initial={{{{ opacity: 0, y: {y_val} }}}}
                                                animate={{{{ opacity: 1, y: 0 }}}}
                                                exit={{{{ opacity: 0, y: {y_exit}, transition: {{ duration: 0.15 }} }}}}
                                                transition={{{{ type: 'spring', stiffness: 300, damping: 24 }}}}
                                                className="{classes}"
                                            >"""

    content = search_pattern.sub(replacer, content)

    # Next, replace the closing tags for this block
    # We find the specific map closer and AnimatePresence
    close_search = re.compile(
        r'</motion\.div>\s*\)\)}\s*</AnimatePresence>',
        re.DOTALL
    )
    # Actually, we can just replace ALL occurrences of this since we replaced all motion.div lists!
    # Wait, Custom Fields might still use motion.div if we didn't give it Reorder.
    
# Global close tag replacement for motion.div inside maps
content = re.sub(
    r'</motion\.div>\s*\)\)}\s*</AnimatePresence>',
    r'</Reorder.Item>\n                                        ))}\n                                        </AnimatePresence>\n                                        </Reorder.Group>',
    content
)

# Custom field closing is followed by <button, so might have a different structure if we changed it, but we didn't touch Custom Fields!
# So Custom Fields will use motion.div normally! Wait, the global replacement will replace Custom Fields too if it matches!
# Let's check Custom Fields end:
# </motion.div>
# ))}\n</AnimatePresence>\n<button
# So the global replace WILL hit Custom Fields and turn it into Reorder.Item which is an error since we didn't open Reorder.Group for it.
# To fix: we can change Custom Fields to use Reorder too!

content = re.sub(
    r'<AnimatePresence initial=\{false\}>\s*\{cvData\.personal\.customFields\.map\(\(field, idx\) => \(\s*<motion\.div.*?className="([^"]+)"\s*>',
    lambda m: f"""<Reorder.Group axis="y" values={{cvData.personal.customFields}} onReorder={{(reordered) => setCvData({{ ...cvData, personal: {{ ...cvData.personal, customFields: reordered }} }})}} className="space-y-3">
                                            <AnimatePresence initial={{false}}>
                                            {{cvData.personal.customFields.map((field, idx) => (
                                                <Reorder.Item
                                                    key={{field.id || idx}}
                                                    value={{field}}
                                                    initial={{{{ opacity: 0, y: 12 }}}}
                                                    animate={{{{ opacity: 1, y: 0 }}}}
                                                    exit={{{{ opacity: 0, y: -8, transition: {{ duration: 0.15 }} }}}}
                                                    transition={{{{ type: 'spring', stiffness: 300, damping: 24 }}}}
                                                    className="{m.group(1)} block bg-white relative"
                                                >
                                                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500">
                                                        <GripVertical className="w-4 h-4" />
                                                    </div>""",
    content, flags=re.DOTALL
)

# String lists handling (skills, certification, language)
for sec in ['skills', 'certification', 'language']:
    # Replace onClick Add
    content = re.sub(
        r"onClick=\{.*?\.\.\.cvData." + sec + r", ''\] \}\)}",
        f"onClick={{() => setCvData({{ ...cvData, {sec}: [...cvData.{sec}, {{ id: crypto.randomUUID(), value: '' }}] }})}}",
        content
    )
    
    var = 'cert' if sec == 'certification' else ('lang' if sec == 'language' else 'skill')
    
    # Replace value={var}
    content = content.replace(f"value={{{var}}}", f"value={{{var}.value}}")
    
    # Replace onChange (newSkills[idx] = e.target.value)
    Cap = sec.capitalize()
    content = content.replace(f"new{Cap}[idx] = e.target.value;", f"new{Cap}[idx] = {{ ...new{Cap}[idx], value: e.target.value }};")

# Also the filter(_, i) => i !== idx
content = content.replace("cvData.skills.filter((f, i) => i !== idx)", "cvData.skills.filter((_, i) => i !== idx)")
content = content.replace("cvData.certification.filter((f, i) => i !== idx)", "cvData.certification.filter((_, i) => i !== idx)")
content = content.replace("cvData.language.filter((f, i) => i !== idx)", "cvData.language.filter((_, i) => i !== idx)")

# Change GripVertical cursors
content = re.sub(
    r'<GripVertical className="([^"]+?text-gray-400 mt-2 flex-shrink-0[^"]*?)" \/>',
    lambda m: f'<GripVertical className="{m.group(1)} cursor-grab active:cursor-grabbing hover:text-gray-600" />' if 'cursor-grab' not in m.group(1) else m.group(0),
    content
)

with open('components/Fill.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fill.tsx fully patched!")
