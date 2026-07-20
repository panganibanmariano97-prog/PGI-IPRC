import re

with open('src/views.tsx', 'r') as f:
    code = f.read()

pattern = r"export const InventoryReportView =.*?export const DashboardView ="

# Read the replacement string from a file so we don't need to worry about Python's re.sub escaping
