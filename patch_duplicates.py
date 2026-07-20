import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Add a state for duplicate error
state_pattern = "  const [showDuplicateModal, setShowDuplicateModal] = useState(false);"
new_state = """  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [txDuplicateError, setTxDuplicateError] = useState(null);"""
code = code.replace(state_pattern, new_state)

# modify handleSaveTx
save_pattern = """  const handleSaveTx = (formData) => {
    const tab = txModal.tab;
    const processedRow = computeDependentFields(tab, formData);
    
    const newData = { ...data };
    if (!newData[tab]) newData[tab] = [];
    
    if (txModal.isEdit) {
      const idx = newData[tab].findIndex(r => r.id === processedRow.id);
      if (idx !== -1) {
        newData[tab][idx] = processedRow;
      }
    } else {
      newData[tab].push(processedRow);
    }
    
    syncCloudState(newData);
    setTxModal({ isOpen: false, row: null, tab: null, isEdit: false });
  };"""

new_save = """  const handleSaveTx = (formData) => {
    const tab = txModal.tab;
    const processedRow = computeDependentFields(tab, formData);
    
    const checkKey = {
      [TABS.PURCHASE]: 'truckscaleControlNo',
      [TABS.TRANSFER]: 'truckscaleControlNo',
      [TABS.PRODUCTION]: 'batchNo',
      [TABS.ISSUANCE]: 'withdrawalSlipNo',
      [TABS.BYPRODUCTS]: 'batchRef'
    }[tab];
    
    const checkLabel = {
      [TABS.PURCHASE]: 'Truckscale No.',
      [TABS.TRANSFER]: 'Truckscale No.',
      [TABS.PRODUCTION]: 'Batch No.',
      [TABS.ISSUANCE]: 'Withdrawal Slip No.',
      [TABS.BYPRODUCTS]: 'Batch Reference No.'
    }[tab];

    if (checkKey) {
      const val = processedRow[checkKey];
      if (val !== undefined && val !== null && val !== '') {
        const normalized = String(val).replace(/\\s+/g, '').toLowerCase();
        if (normalized) {
           const isDuplicate = data[tab]?.some(r => {
             if (txModal.isEdit && r.id === processedRow.id) return false;
             const rVal = r[checkKey];
             if (rVal === undefined || rVal === null || rVal === '') return false;
             return String(rVal).replace(/\\s+/g, '').toLowerCase() === normalized;
           });
           
           if (isDuplicate) {
              setTxDuplicateError([{ tab, label: checkLabel, original: val, count: 2 }]);
              return; // Do not save, do not close txModal
           }
        }
      }
    }

    const newData = { ...data };
    if (!newData[tab]) newData[tab] = [];
    
    if (txModal.isEdit) {
      const idx = newData[tab].findIndex(r => r.id === processedRow.id);
      if (idx !== -1) {
        newData[tab][idx] = processedRow;
      }
    } else {
      newData[tab].push(processedRow);
    }
    
    syncCloudState(newData);
    setTxModal({ isOpen: false, row: null, tab: null, isEdit: false });
  };"""

code = code.replace(save_pattern, new_save)

# modify DuplicateModal JSX
dup_modal_pattern = """      {showDuplicateModal && (
        <DuplicateModal 
          duplicates={duplicates} 
          onClose={() => setShowDuplicateModal(false)} 
        />
      )}"""
new_dup_modal = """      {showDuplicateModal && (
        <DuplicateModal 
          duplicates={duplicates} 
          onClose={() => setShowDuplicateModal(false)} 
        />
      )}
      {txDuplicateError && (
        <DuplicateModal 
          duplicates={txDuplicateError} 
          onClose={() => setTxDuplicateError(null)} 
        />
      )}"""
code = code.replace(dup_modal_pattern, new_dup_modal)

with open('src/App.tsx', 'w') as f:
    f.write(code)
