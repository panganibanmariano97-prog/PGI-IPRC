import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Add TransactionModal to imports
code = code.replace("import { Login, FilterToolbar, DataGrid, SettingsPanel, DuplicateModal } from './components';",
"import { Login, FilterToolbar, DataGrid, SettingsPanel, DuplicateModal, TransactionModal } from './components';")

with open('src/App.tsx', 'w') as f:
    f.write(code)

