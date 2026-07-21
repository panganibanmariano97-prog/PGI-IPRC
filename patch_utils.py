import re

with open('src/utils.ts', 'r') as f:
    content = f.read()

# Update createEmptyRow
create_purchase = "return { id, date, truckscaleControlNo: '', supplier: '', address: '', idNo: '', areaHarvested: 0, variety: '', bags: 0, weight: 0, price: 0, total: 0 };"
content = re.sub(
    r"return \{ id, date, truckscaleControlNo: '', supplier: '', variety: '', bags: 0, weight: 0, price: 0, total: 0 \};",
    create_purchase,
    content
)

# Update getColumns
cols_purchase = """  [TABS.PURCHASE]: [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'truckscaleControlNo', label: 'Truckscale Control No.', type: 'text' },
    { key: 'supplier', label: 'Supplier/Farmer', type: 'text' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'idNo', label: 'ID No.', type: 'text' },
    { key: 'areaHarvested', label: 'Area Harvested (ha)', type: 'number' },
    { key: 'variety', label: 'Item/Variety', type: 'text' },
    { key: 'bags', label: 'Bags', type: 'number', sum: true },
    { key: 'weight', label: 'Net Weight (kg)', type: 'number', sum: true },
    { key: 'price', label: 'Price/kg (₱)', type: 'number' },
    { key: 'total', label: 'Total Cost (₱)', type: 'number', sum: true, readOnly: true }
  ],"""

content = re.sub(
    r"\[TABS\.PURCHASE\]: \[\s*\{ key: 'date', label: 'Date', type: 'date' \},\s*\{ key: 'truckscaleControlNo', label: 'Truckscale Control No\.', type: 'text' \},\s*\{ key: 'supplier', label: 'Supplier/Farmer', type: 'text' \},\s*\{ key: 'variety', label: 'Item/Variety', type: 'text' \},\s*\{ key: 'bags', label: 'Bags', type: 'number', sum: true \},\s*\{ key: 'weight', label: 'Net Weight \(kg\)', type: 'number', sum: true \},\s*\{ key: 'price', label: 'Price/kg \(₱\)', type: 'number' \},\s*\{ key: 'total', label: 'Total Cost \(₱\)', type: 'number', sum: true, readOnly: true \}\s*\],",
    cols_purchase,
    content
)

# Update initialData (TABS.PURCHASE array elements)
content = content.replace(
    "truckscaleControlNo: 'TC-1001', supplier: 'Santiago Farmers Coop', variety:",
    "truckscaleControlNo: 'TC-1001', supplier: 'Santiago Farmers Coop', address: '', idNo: '', areaHarvested: 0, variety:"
)
content = content.replace(
    "truckscaleControlNo: 'TC-1002', supplier: 'Santiago Farmers Coop', variety:",
    "truckscaleControlNo: 'TC-1002', supplier: 'Santiago Farmers Coop', address: '', idNo: '', areaHarvested: 0, variety:"
)
content = content.replace(
    "truckscaleControlNo: 'TC-1003', supplier: 'Alicia Agri-Corp', variety:",
    "truckscaleControlNo: 'TC-1003', supplier: 'Alicia Agri-Corp', address: '', idNo: '', areaHarvested: 0, variety:"
)


with open('src/utils.ts', 'w') as f:
    f.write(content)

