import re

with open('src/views.tsx', 'r') as f:
    code = f.read()

pattern = r"sheetsData\.push\(\{ tabName: \"Byproducts Ledger\"[\s\S]*?\}\);\s*\}\s*\n\s*\}\);"
replacement = r"""sheetsData.push({ tabName: "Byproducts Ledger", facilityName: settings.facilityName, reportKind: "CONSOLIDATED BYPRODUCTS LEDGER", timeframeStr, dataRows: bypRows, numCols: 17 });"""

code = re.sub(pattern, replacement, code)

with open('src/views.tsx', 'w') as f:
    f.write(code)

