import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

state_pattern = r"  const \[selectedItemType, setSelectedItemType\] = useState\('All'\);"
new_state = """  const [selectedItemType, setSelectedItemType] = useState('All');
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const duplicates = useMemo(() => {
    const dups = [];
    const checkDuplicates = (tab, keyName, label) => {
      if (!data || !data[tab]) return;
      const seen = {};
      data[tab].forEach((row) => {
        const val = row[keyName];
        if (val === undefined || val === null || val === '') return;
        const normalized = String(val).replace(/\\s+/g, '').toLowerCase();
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

    checkDuplicates(TABS.PURCHASE, 'truckscaleControlNo', 'Truckscale No.');
    checkDuplicates(TABS.TRANSFER, 'truckscaleControlNo', 'Truckscale No.');
    checkDuplicates(TABS.PRODUCTION, 'batchNo', 'Batch No.');
    checkDuplicates(TABS.ISSUANCE, 'withdrawalSlipNo', 'Withdrawal Slip No.');
    checkDuplicates(TABS.BYPRODUCTS, 'batchRef', 'Batch Reference No.');

    return dups;
  }, [data]);"""

code = code.replace("  const [selectedItemType, setSelectedItemType] = useState('All');", new_state)

with open('src/App.tsx', 'w') as f:
    f.write(code)

