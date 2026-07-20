import re

with open('src/utils.ts', 'r') as f:
    code = f.read()

# 1. Update handleAddRow
code = re.sub(
    r"case TABS\.ISSUANCE:\s+return \{ id, date, destination: '', item: '', bagSize: defaultBagSize, bags: 0, unitCost: 0, totalAmount: 0, totalWeight: 0, plateNo: '' \};",
    r"case TABS.ISSUANCE:\n      return { id, date, withdrawalSlipNo: '', destination: '', sectoralGroup: '', item: '', bagSize: defaultBagSize, bags: 0, unitCost: 0, totalAmount: 0, totalWeight: 0 };",
    code
)

# 2. Update getColumns
columns_pattern = r"\[TABS\.ISSUANCE\]:\s*\[\s*\{\s*key:\s*'date',\s*label:\s*'Date',\s*type:\s*'date'\s*\},\s*\{\s*key:\s*'destination',\s*label:\s*'Client/Destination',\s*type:\s*'text'\s*\},\s*\{\s*key:\s*'item',\s*label:\s*'Item Description',\s*type:\s*'text'\s*\},\s*\{\s*key:\s*'bagSize',\s*label:\s*'Bag Size',\s*type:\s*'select',\s*options:\s*bagSizes\s*\},\s*\{\s*key:\s*'bags',\s*label:\s*'Quantity \(Bags\)',\s*type:\s*'number',\s*sum:\s*true\s*\},\s*\{\s*key:\s*'unitCost',\s*label:\s*'Unit Cost \(₱\)',\s*type:\s*'number'\s*\},\s*\{\s*key:\s*'totalAmount',\s*label:\s*'Total Amount \(₱\)',\s*type:\s*'number',\s*sum:\s*true,\s*readOnly:\s*true\s*\},\s*\{\s*key:\s*'totalWeight',\s*label:\s*'Total Weight \(kg\)',\s*type:\s*'number',\s*sum:\s*true,\s*readOnly:\s*true\s*\},\s*\{\s*key:\s*'plateNo',\s*label:\s*'Driver/Plate No\.',\s*type:\s*'text'\s*\}\s*\]"
new_columns = """[TABS.ISSUANCE]: [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'withdrawalSlipNo', label: 'Withdrawal Slip No.', type: 'text' },
    { key: 'destination', label: 'Client/Destination', type: 'text' },
    { key: 'sectoralGroup', label: 'Sectoral Group', type: 'text' },
    { key: 'item', label: 'Item Description', type: 'text' },
    { key: 'bagSize', label: 'Bag Size', type: 'select', options: bagSizes },
    { key: 'bags', label: 'Quantity (Bags)', type: 'number', sum: true },
    { key: 'unitCost', label: 'Unit Cost (₱)', type: 'number' },
    { key: 'totalAmount', label: 'Total Amount (₱)', type: 'number', sum: true, readOnly: true },
    { key: 'totalWeight', label: 'Total Weight (kg)', type: 'number', sum: true, readOnly: true }
  ]"""
code = re.sub(columns_pattern, new_columns, code)

# 3. Update INITIAL_DATA
initial_data_pattern = r"\[TABS\.ISSUANCE\]:\s*\[\s*\{\s*id:\s*generateId\(\),\s*date:\s*'2023-09-22',\s*destination:\s*'Cauayan Trading Post',\s*item:\s*'Premium Milled',\s*bagSize:\s*'50kgs',\s*bags:\s*60,\s*unitCost:\s*1200,\s*totalAmount:\s*72000,\s*totalWeight:\s*3000,\s*plateNo:\s*'TKN-112'\s*\},\s*\{\s*id:\s*generateId\(\),\s*date:\s*'2026-06-20',\s*destination:\s*'Cauayan Trading Post',\s*item:\s*'Premium Milled',\s*bagSize:\s*'25kgs',\s*bags:\s*200,\s*unitCost:\s*650,\s*totalAmount:\s*130000,\s*totalWeight:\s*5000,\s*plateNo:\s*'TKN-411'\s*\},\s*\{\s*id:\s*generateId\(\),\s*date:\s*'2026-06-22',\s*destination:\s*'NFA Isabela Depot',\s*item:\s*'Milled Sinandomeng',\s*bagSize:\s*'50kgs',\s*bags:\s*100,\s*unitCost:\s*1150,\s*totalAmount:\s*115000,\s*totalWeight:\s*5000,\s*plateNo:\s*'WOS-382'\s*\},\s*\{\s*id:\s*generateId\(\),\s*date:\s*'2026-06-22',\s*destination:\s*'Manila Retailer Hub',\s*item:\s*'Fancy Rice',\s*bagSize:\s*'10kgs',\s*bags:\s*150,\s*unitCost:\s*450,\s*totalAmount:\s*67500,\s*totalWeight:\s*1500,\s*plateNo:\s*'XCS-902'\s*\},\s*\{\s*id:\s*generateId\(\),\s*date:\s*'2026-06-22',\s*destination:\s*'Local Cooperatives',\s*item:\s*'Premium Milled',\s*bagSize:\s*'5kgs',\s*bags:\s*300,\s*unitCost:\s*240,\s*totalAmount:\s*72000,\s*totalWeight:\s*1500,\s*plateNo:\s*'YRE-481'\s*\}\s*\]"
new_initial_data = """[TABS.ISSUANCE]: [
    { id: generateId(), date: '2023-09-22', withdrawalSlipNo: 'WS-001', destination: 'Cauayan Trading Post', sectoralGroup: 'Trade', item: 'Premium Milled', bagSize: '50kgs', bags: 60, unitCost: 1200, totalAmount: 72000, totalWeight: 3000 },
    { id: generateId(), date: '2026-06-20', withdrawalSlipNo: 'WS-002', destination: 'Cauayan Trading Post', sectoralGroup: 'Trade', item: 'Premium Milled', bagSize: '25kgs', bags: 200, unitCost: 650, totalAmount: 130000, totalWeight: 5000 },
    { id: generateId(), date: '2026-06-22', withdrawalSlipNo: 'WS-003', destination: 'NFA Isabela Depot', sectoralGroup: 'Government', item: 'Milled Sinandomeng', bagSize: '50kgs', bags: 100, unitCost: 1150, totalAmount: 115000, totalWeight: 5000 },
    { id: generateId(), date: '2026-06-22', withdrawalSlipNo: 'WS-004', destination: 'Manila Retailer Hub', sectoralGroup: 'Retail', item: 'Fancy Rice', bagSize: '10kgs', bags: 150, unitCost: 450, totalAmount: 67500, totalWeight: 1500 },
    { id: generateId(), date: '2026-06-22', withdrawalSlipNo: 'WS-005', destination: 'Local Cooperatives', sectoralGroup: 'Cooperative', item: 'Premium Milled', bagSize: '5kgs', bags: 300, unitCost: 240, totalAmount: 72000, totalWeight: 1500 }
  ]"""
code = re.sub(initial_data_pattern, new_initial_data, code)

with open('src/utils.ts', 'w') as f:
    f.write(code)

