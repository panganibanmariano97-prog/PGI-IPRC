import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

state_pattern = r"  const \[showDuplicateModal, setShowDuplicateModal\] = useState\(false\);"
new_state = """  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [txModal, setTxModal] = useState({ isOpen: false, row: null, tab: null, isEdit: false });"""
code = code.replace(state_pattern, new_state)

with open('src/App.tsx', 'w') as f:
    f.write(code)
