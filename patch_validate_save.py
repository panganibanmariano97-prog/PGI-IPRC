import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

save_tx_orig = """    if (checkKey) {
      const val = processedRow[checkKey];
      if (val !== undefined && val !== null && val !== '') {
        const normalized = String(val).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        if (normalized) {
           const isDuplicate = data[tab]?.some(r => {
             if (txModal.isEdit && r.id === processedRow.id) return false;
             const rVal = r[checkKey];
             if (rVal === undefined || rVal === null || rVal === '') return false;
             return String(rVal).replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === normalized;
           });
              
           if (isDuplicate) {
              setTxDuplicateError([{ tab, label: checkLabel, original: val, count: 2 }]);
              return; // Do not save, do not close txModal
           }
        }
      }
    }

    const newData = { ...data };"""

save_tx_new = """    if (checkKey) {
      const val = processedRow[checkKey];
      if (val !== undefined && val !== null && val !== '') {
        const normalized = String(val).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        if (normalized) {
           const isDuplicate = data[tab]?.some(r => {
             if (txModal.isEdit && r.id === processedRow.id) return false;
             const rVal = r[checkKey];
             if (rVal === undefined || rVal === null || rVal === '') return false;
             return String(rVal).replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === normalized;
           });
              
           if (isDuplicate) {
              setTxDuplicateError([{ tab, label: checkLabel, original: val, count: 2 }]);
              return; // Do not save, do not close txModal
           }
        }
      }
    }

    if (tab === TABS.PURCHASE) {
      const rDate = processedRow.date;
      const rSupplier = processedRow.supplier;
      
      if (rDate && rSupplier) {
        const [y, m] = rDate.split('-');
        if (y && m) {
          const year = parseInt(y, 10);
          const month = parseInt(m, 10);
          const season = month <= 6 ? '1st Cropping Season' : '2nd Cropping Season';
          const normalizedFarmer = String(rSupplier).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          
          if (normalizedFarmer) {
            const isDuplicate = data[tab]?.some(r => {
              if (txModal.isEdit && r.id === processedRow.id) return false;
              if (!r.date || !r.supplier) return false;
              const [ry, rm] = r.date.split('-');
              if (!ry || !rm) return false;
              const rSeason = parseInt(rm, 10) <= 6 ? '1st Cropping Season' : '2nd Cropping Season';
              if (parseInt(ry, 10) !== year || rSeason !== season) return false;
              return String(r.supplier).replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === normalizedFarmer;
            });
            
            if (isDuplicate) {
              setTxDuplicateError([{ tab, label: `Farmer in ${season} ${year}`, original: rSupplier, count: 2 }]);
              return; // Do not save, do not close txModal
            }
          }
        }
      }
    }

    const newData = { ...data };"""

content = content.replace(save_tx_orig, save_tx_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)
