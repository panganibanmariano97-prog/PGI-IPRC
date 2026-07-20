import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# modify handleDataUpdate
update_pattern = """  const handleDataUpdate = (tab, rowId, field, value) => {
    const newData = { ...data };
    const tabData = [...(newData[tab] || [])];
    const rowIndex = tabData.findIndex(r => r.id === rowId);
    
    if (rowIndex === -1) return;

    const row = { ...tabData[rowIndex] };"""

new_update = """  const handleDataUpdate = (tab, rowId, field, value) => {
    const newData = { ...data };
    const tabData = [...(newData[tab] || [])];
    const rowIndex = tabData.findIndex(r => r.id === rowId);
    
    if (rowIndex === -1) return;

    // Check for duplication on inline edit
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
           if (r.id === rowId) return false; // don't compare with self
           const rVal = r[checkKey];
           if (rVal === undefined || rVal === null || rVal === '') return false;
           return String(rVal).replace(/\\s+/g, '').toLowerCase() === normalized;
         });
         
         if (isDuplicate) {
            setTxDuplicateError([{ tab, label: checkLabel, original: value, count: 2 }]);
            return; // Do not update
         }
      }
    }

    const row = { ...tabData[rowIndex] };"""

code = code.replace(update_pattern, new_update)

with open('src/App.tsx', 'w') as f:
    f.write(code)
