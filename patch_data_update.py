import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

update_start = "  const handleDataUpdate = (tab, rowId, field, value) => {\n    const newData = { ...data };\n    const tabData = [...(newData[tab] || [])];\n    const rowIndex = tabData.findIndex(r => r.id === rowId);\n    \n    if (rowIndex === -1) return;\n\n    const row = { ...tabData[rowIndex] };"
update_replacement = """  const handleDataUpdate = (tab, rowId, field, value) => {
    const newData = { ...data };
    const tabData = [...(newData[tab] || [])];
    const rowIndex = tabData.findIndex(r => r.id === rowId);
    
    if (rowIndex === -1) return;

    const checkKey = {
      [TABS.PURCHASE]: 'truckscaleControlNo',
      [TABS.TRANSFER]: 'truckscaleControlNo',
      [TABS.PRODUCTION]: 'batchNo',
      [TABS.ISSUANCE]: 'withdrawalSlipNo',
      [TABS.BYPRODUCTS]: 'batchRef'
    }[tab];
    
    if (field === checkKey) {
      const checkLabel = {
        [TABS.PURCHASE]: 'Truckscale No.',
        [TABS.TRANSFER]: 'Truckscale No.',
        [TABS.PRODUCTION]: 'Batch No.',
        [TABS.ISSUANCE]: 'Withdrawal Slip No.',
        [TABS.BYPRODUCTS]: 'Batch Reference No.'
      }[tab];
      
      const normalized = String(value).replace(/\\s+/g, '').toLowerCase();
      if (normalized) {
         const isDuplicate = tabData.some(r => {
           if (r.id === rowId) return false;
           const rVal = r[checkKey];
           if (rVal === undefined || rVal === null || rVal === '') return false;
           return String(rVal).replace(/\\s+/g, '').toLowerCase() === normalized;
         });
         
         if (isDuplicate) {
            setTxDuplicateError([{ tab, label: checkLabel, original: value, count: 2 }]);
            return;
         }
      }
    }

    const row = { ...tabData[rowIndex] };"""

if update_start in code:
    print("Found update_start string.")
    code = code.replace(update_start, update_replacement)
else:
    print("Could not find update_start string. Trying regex.")
    
with open('src/App.tsx', 'w') as f:
    f.write(code)
