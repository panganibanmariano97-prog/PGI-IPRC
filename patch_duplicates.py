import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

new_duplicates = """  const duplicates = useMemo(() => {
    const dups = [];
    const checkDuplicates = (tab, keyName, label) => {
      if (!data || !data[tab]) return;
      const seen = {};
      data[tab].forEach((row) => {
        const val = row[keyName];
        if (val === undefined || val === null || val === '') return;
        const normalized = String(val).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        if (!normalized) return;
        if (seen[normalized]) {
          seen[normalized].count++;
        } else {
          seen[normalized] = { count: 1, original: val, tab, label };
        }
      });
      Object.values(seen).forEach(item => {
        if (item.count > 1) {
          dups.push(item);
        }
      });
    };

    const checkFarmerSeasons = () => {
      if (!data || !data[TABS.PURCHASE]) return;
      const seen = {};
      data[TABS.PURCHASE].forEach(row => {
        const farmer = row.supplier;
        const dateStr = row.date;
        if (!farmer || !dateStr) return;
        const [y, m, d] = dateStr.split('-');
        if (!y || !m) return;
        
        const year = parseInt(y, 10);
        const month = parseInt(m, 10);
        const season = month <= 6 ? '1st Cropping Season' : '2nd Cropping Season';
        
        const normalizedFarmer = String(farmer).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        if (!normalizedFarmer) return;
        
        const key = `${normalizedFarmer}-${year}-${season}`;
        
        if (seen[key]) {
          seen[key].count++;
        } else {
          seen[key] = { 
            count: 1, 
            original: farmer, 
            tab: TABS.PURCHASE, 
            label: `Farmer in ${season} ${year}`,
            season: season,
            year: year
          };
        }
      });
      
      Object.values(seen).forEach(item => {
        if (item.count > 1) {
          dups.push(item);
        }
      });
    };

    checkDuplicates(TABS.PURCHASE, 'truckscaleControlNo', 'Truckscale No.');
    checkFarmerSeasons();
    checkDuplicates(TABS.TRANSFER, 'truckscaleControlNo', 'Truckscale No.');
    checkDuplicates(TABS.PRODUCTION, 'batchNo', 'Batch No.');
    checkDuplicates(TABS.ISSUANCE, 'withdrawalSlipNo', 'Withdrawal Slip No.');
    checkDuplicates(TABS.BYPRODUCTS, 'batchRef', 'Batch Reference No.');

    return dups;
  }, [data]);"""

content = re.sub(
    r"  const duplicates = useMemo\(\(\) => \{.*?\n  \}, \[data\]\);",
    new_duplicates,
    content,
    flags=re.DOTALL
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
