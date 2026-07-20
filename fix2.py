import re

with open('src/views.tsx', 'r') as f:
    code = f.read()

pattern = r"export const InventoryReportView =.*?(?=export const DashboardView =)"

with open('replacement.txt', 'r') as fr:
    replacement = fr.read()

new_code = re.sub(pattern, replacement, code, flags=re.DOTALL)

with open('src/views.tsx', 'w') as f:
    f.write(new_code)
print("Done")
