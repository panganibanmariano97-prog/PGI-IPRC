import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

orig_prod_ro = "readOnly={isReadOnly}"
new_prod_ro = "readOnly={!canEditTab(TABS.PRODUCTION)}"
# We only want to replace the first occurrence (which is ProductionDashboardView)
# Wait, let's be more precise
content = content.replace("readOnly={isReadOnly}", "readOnly={!canEditTab(activeTab)}", 1) # This might be risky, let's use regex

