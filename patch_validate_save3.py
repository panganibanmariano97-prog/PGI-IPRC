import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

new_block = """    }

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
              return;
            }
          }
        }
      }
    }

    const newData = { ...data };"""

content = re.sub(r"    \}\n\n    const newData = \{ \.\.\.data \};\n    if \(\!newData\[tab\]\)", new_block + "\n    if (!newData[tab])", content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
