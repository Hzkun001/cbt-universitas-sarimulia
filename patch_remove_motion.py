import re

files = [
    'src/routes/_authenticated/admin.evaluasi.tsx',
    'src/routes/_authenticated/admin.evaluasi.$id.tsx'
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # Remove cubic-bezier classes
    content = re.sub(r'ease-\[cubic-bezier\(.*?\)\]', '', content)
    # Remove duration-300, duration-500, duration-1000
    content = re.sub(r'\bduration-(300|500|1000)\b', '', content)
    # Remove hover:scale-[...]
    content = re.sub(r'hover:scale-\[[0-9.]+\]', '', content)
    # Remove active:scale-[...]
    content = re.sub(r'active:scale-\[?[0-9.]+\]?', '', content)
    # Remove group-hover:scale-...
    content = re.sub(r'group-hover:scale-\d+', '', content)
    # Remove group-hover:rotate-...
    content = re.sub(r'group-hover:rotate-\d+', '', content)
    # Remove group-hover:translate-...
    content = re.sub(r'group-hover:translate-[x|y]-\d+', '', content)
    # Remove origin-left, transform-gpu
    content = re.sub(r'\borigin-left\b', '', content)
    content = re.sub(r'\btransform-gpu\b', '', content)

    # Clean up multiple spaces left over
    content = re.sub(r' +', ' ', content)
    content = re.sub(r' "', '"', content)
    content = re.sub(r'" ', '"', content)
    content = re.sub(r' }', '}', content)

    with open(file, 'w') as f:
        f.write(content)
