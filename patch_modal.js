const fs = require('fs');
let code = fs.readFileSync('src/components.tsx', 'utf8');
code = code.replace("import { Plus, Download, X, Settings as SettingsIcon, LogOut } from 'lucide-react';", "import { Plus, Download, X, Settings as SettingsIcon, LogOut, Edit2 } from 'lucide-react';\nimport { createEmptyRow, getBagWeight } from './utils';");
fs.writeFileSync('src/components.tsx', code);
