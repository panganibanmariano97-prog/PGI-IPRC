import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

data_update_orig = """    const row = { ...tabData[rowIndex] };

    const colDef = getColumns(settings.bagSizes || DEFAULT_BAG_SIZES, settings.warehouses || DEFAULT_WAREHOUSES)[tab]?.find(c => c.key === field);
    if (colDef?.type === 'number') {
      row[field] = value === '' ? '' : parseFloat(value) || 0;
    } else {
      row[field] = value;
    }

    if (tab === TABS.PURCHASE) {"""

data_update_new = """    const row = { ...tabData[rowIndex] };

    const colDef = getColumns(settings.bagSizes || DEFAULT_BAG_SIZES, settings.warehouses || DEFAULT_WAREHOUSES)[tab]?.find(c => c.key === field);
    if (colDef?.type === 'number') {
      row[field] = value === '' ? '' : parseFloat(value) || 0;
    } else {
      row[field] = value;
    }

    if (tab === TABS.PURCHASE && (field === 'supplier' || field === 'date')) {
      const rDate = row.date;
      const rSupplier = row.supplier;
      
      if (rDate && rSupplier) {
        const [y, m] = rDate.split('-');
        if (y && m) {
          const year = parseInt(y, 10);
          const month = parseInt(m, 10);
          const season = month <= 6 ? '1st Cropping Season' : '2nd Cropping Season';
          const normalizedFarmer = String(rSupplier).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          
          if (normalizedFarmer) {
            const isDuplicate = tabData.some(r => {
              if (r.id === rowId) return false;
              if (!r.date || !r.supplier) return false;
              const [ry, rm] = r.date.split('-');
              if (!ry || !rm) return false;
              const rSeason = parseInt(rm, 10) <= 6 ? '1st Cropping Season' : '2nd Cropping Season';
              if (parseInt(ry, 10) !== year || rSeason !== season) return false;
              return String(r.supplier).replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === normalizedFarmer;
            });
            
            if (isDuplicate) {
              setTxDuplicateError([{ tab, label: `Farmer in ${season} ${year}`, original: rSupplier, count: 2 }]);
              return;
            }
          }
        }
      }
    }

    if (tab === TABS.PURCHASE) {"""

content = content.replace(data_update_orig, data_update_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)
