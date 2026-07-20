import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

code = code.replace(r".replace(/\s+/g, '')", r".replace(/[^a-zA-Z0-9]/g, '')")
code = code.replace(r".replace(/\\s+/g, '')", r".replace(/[^a-zA-Z0-9]/g, '')")

with open('src/App.tsx', 'w') as f:
    f.write(code)
