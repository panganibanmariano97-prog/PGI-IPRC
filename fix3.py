with open('replacement.txt', 'r') as f:
    text = f.read()

# The text currently ends with:
# export const DashboardView ="""
#
# with open('replacement.txt', 'r') as fr:
# ...
# we want to strip everything from export const DashboardView =""" onwards.
idx = text.find('export const DashboardView ="""')
if idx != -1:
    text = text[:idx]

with open('replacement.txt', 'w') as f:
    f.write(text)

import re
with open('src/views.tsx', 'r') as f:
    code = f.read()

pattern = r"export const InventoryReportView =.*?(?=export const DashboardView =)"
new_code = re.sub(pattern, text, code, flags=re.DOTALL)

with open('src/views.tsx', 'w') as f:
    f.write(new_code)
