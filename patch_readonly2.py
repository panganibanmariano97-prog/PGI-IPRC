with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "readOnly={isReadOnly}" in line:
        if "ProductionDashboardView" in "".join(lines[max(0, i-20):i+5]):
            lines[i] = line.replace("readOnly={isReadOnly}", "readOnly={!canEditTab(TABS.PRODUCTION)}")
        else:
            lines[i] = line.replace("readOnly={isReadOnly}", "readOnly={!canEditTab(activeTab)}")

with open('src/App.tsx', 'w') as f:
    f.writelines(lines)
