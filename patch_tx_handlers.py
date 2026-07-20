import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Add handleSaveTx
add_row_pattern = "  const handleAddRow = (tab, defaultCategory = null) => {"
new_handlers = """
  const computeDependentFields = (tab, row) => {
    const updated = { ...row };
    
    if (tab === TABS.PURCHASE) {
      const w = parseFloat(updated.weight) || 0;
      const p = parseFloat(updated.price) || 0;
      updated.total = w * p;
    }
    if (tab === TABS.PRODUCTION) {
      const sizeKg = getBagWeight(updated.bagSize);
      const bags = parseFloat(updated.outputBags) || 0;
      const inPalay = parseFloat(updated.inputPalay) || 0;
      updated.outputRice = sizeKg * bags;
      updated.byproduct = Math.max(0, inPalay - updated.outputRice);
      updated.recovery = inPalay > 0 ? ((updated.outputRice / inPalay) * 100).toFixed(2) : 0;
    }
    if (tab === TABS.ISSUANCE) {
      const sizeKg = getBagWeight(updated.bagSize);
      const bags = parseFloat(updated.bags) || 0;
      const unitCost = parseFloat(updated.unitCost) || 0;
      updated.totalWeight = sizeKg * bags;
      updated.totalAmount = bags * unitCost;
    }
    if (tab === TABS.BYPRODUCTS) {
      const keys = ['riceHull', 'riceBran', 'brewer', 'spoilage', 'shrinkage', 'loss'];
      let total = 0;
      keys.forEach(k => {
        total += parseFloat(updated[k]) || 0;
      });
      updated.quantity = total;
    }
    return updated;
  };

  const handleOpenAddModal = (tab) => {
    const today = new Date();
    const currentY = today.getFullYear();
    const currentM = (today.getMonth() + 1).toString().padStart(2, '0');
    const currentD = today.getDate().toString().padStart(2, '0');
    
    let defaultDate = `${currentY}-${currentM}-${currentD}`;
    if (timeframe === 'monthly') {
      defaultDate = `${selectedMonth}-01`;
    } else if (timeframe === 'yearly') {
      defaultDate = `${selectedYear}-${currentM}-${currentD}`; 
    }
    const [y, m] = defaultDate.split('-');
    if (parseInt(y) < 2023 || (parseInt(y) === 2023 && parseInt(m) < 9)) {
      defaultDate = '2023-09-01';
    }

    const currentBagSizes = settings.bagSizes || DEFAULT_BAG_SIZES;
    const defaultDynamicSize = currentBagSizes.length > 0 ? currentBagSizes[currentBagSizes.length - 1] : '50kgs';
    const currentWarehouses = settings.warehouses || DEFAULT_WAREHOUSES;
    const defaultDynamicWarehouse = currentWarehouses.length > 0 ? currentWarehouses[0] : 'NFA ECHAGUE';
    
    const prepopulatedBagSize = (selectedBagSize !== 'All' && (tab === TABS.PRODUCTION || tab === TABS.ISSUANCE)) 
      ? selectedBagSize 
      : defaultDynamicSize;
      
    const newRow = createEmptyRow(tab, defaultDate, prepopulatedBagSize, defaultDynamicWarehouse);
    setTxModal({ isOpen: true, tab, row: newRow, isEdit: false });
  };

  const handleOpenEditModal = (tab, row) => {
    setTxModal({ isOpen: true, tab, row, isEdit: true });
  };

  const handleSaveTx = (formData) => {
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
  };

  const handleAddRow = (tab, defaultCategory = null) => {"""
code = code.replace(add_row_pattern, new_handlers)

with open('src/App.tsx', 'w') as f:
    f.write(code)

