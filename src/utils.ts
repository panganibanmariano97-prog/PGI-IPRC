// @ts-nocheck
export const ROLES = {
  ADMINISTRATOR: 'Administrator',
  ACCOUNTING: 'Accounting',
  PURCHASE: 'Purchase',
  PRODUCTION: 'Production',
  OBSERVER: 'Observer'
};

export const TABS = {
  DASHBOARD: 'dashboard',
  INVENTORY: 'inventory',
  PURCHASE: 'purchase',
  TRANSFER: 'transfer',
  PRODUCTION: 'production',
  ISSUANCE: 'issuance',
  BYPRODUCTS: 'byproducts',
  OTHERS: 'others',
  SETTINGS: 'settings'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMINISTRATOR]: [TABS.DASHBOARD, TABS.INVENTORY, TABS.PURCHASE, TABS.TRANSFER, TABS.PRODUCTION, TABS.ISSUANCE, TABS.BYPRODUCTS, TABS.OTHERS, TABS.SETTINGS],
  [ROLES.ACCOUNTING]: [TABS.DASHBOARD, TABS.INVENTORY, TABS.PURCHASE, TABS.TRANSFER, TABS.PRODUCTION, TABS.ISSUANCE, TABS.BYPRODUCTS, TABS.OTHERS],
  [ROLES.PURCHASE]: [TABS.PURCHASE],
  [ROLES.PRODUCTION]: [TABS.TRANSFER, TABS.PRODUCTION, TABS.ISSUANCE, TABS.BYPRODUCTS, TABS.OTHERS],
  [ROLES.OBSERVER]: [TABS.DASHBOARD, TABS.INVENTORY, TABS.PURCHASE, TABS.TRANSFER, TABS.PRODUCTION, TABS.ISSUANCE, TABS.BYPRODUCTS, TABS.OTHERS]
};

export const DEFAULT_BAG_SIZES = ['5kgs', '8kgs', '10kgs', '12kgs', '15kgs', '20kgs', '25kgs', '40kgs', '50kgs'];
export const DEFAULT_WAREHOUSES = ['NFA ECHAGUE', 'RAMON WAREHOUSE', 'ROXAS WAREHOUSE', 'IRPC-IPIL'];
export const BYPRODUCT_CATEGORIES = ['Rice Hull', 'Rice Bran', 'Spoilage (Yellow Rice)', 'Brewer', 'Shrinkage', 'Loss'];

export const getBagWeight = (sizeStr) => {
  return parseFloat(sizeStr) || 0;
};

export const formatToMMDDYYYY = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${m}/${d}/${y}`;
};

export const getTimeframeStr = (timeframe, selectedMonth, selectedYear) => {
  if (timeframe === 'monthly') {
    const [year, month] = selectedMonth.split('-');
    const dateObj = new Date(year, parseInt(month) - 1, 1);
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
    return `FOR THE MONTH OF ${monthName.toUpperCase()}, ${year}`;
  } else if (timeframe === 'yearly') {
    return `FOR THE YEAR ${selectedYear}`;
  }
  return `OVERALL PERIOD`;
};

// --- EXCEL FORMATTING DEFINITIONS ---
export const fmtQty = (val) => ({ v: parseFloat(val) || 0, t: 'n', z: '#,##0' });
export const fmtCost = (val) => ({ v: parseFloat(val) || 0, t: 'n', z: '#,##0.00' });
export const fmtPct = (val) => ({ v: parseFloat(val) || 0, t: 'n', z: '0.00"%"' });

export const loadXLSXStyle = () => {
  return new Promise((resolve, reject) => {
    if (window.XLSX) {
      resolve(window.XLSX);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.min.js';
    script.onload = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error('Failed to load xlsx-js-style'));
    document.head.appendChild(script);
  });
};

export const exportToStyledXLSX = async (sheetsData, filename) => {
  try {
    const XLSX = await loadXLSXStyle();
    const wb = XLSX.utils.book_new();

    sheetsData.forEach(sheet => {
      const { tabName, facilityName, reportKind, timeframeStr, dataRows, numCols } = sheet;
      const wsData = [];
      
      const headerStyle = { font: { name: 'Calibri', sz: 12, bold: true }, alignment: { horizontal: 'center', vertical: 'center' } };
      wsData.push([{ v: "PROVINCE OF ISABELA", s: headerStyle }]);
      wsData.push([{ v: (facilityName || '').toUpperCase(), s: headerStyle }]);
      wsData.push([{ v: (reportKind || '').toUpperCase(), s: headerStyle }]);
      wsData.push([{ v: (timeframeStr || '').toUpperCase(), s: headerStyle }]);
      wsData.push([]); 

      const dataStyle = { font: { name: 'Calibri', sz: 11 }, alignment: { horizontal: 'center', vertical: 'center' } };
      dataRows.forEach(row => {
        const styledRow = row.map(cellValue => {
          if (cellValue !== null && typeof cellValue === 'object' && 'v' in cellValue) {
            return {
              ...cellValue,
              s: { ...dataStyle, ...(cellValue.s || {}) }
            };
          }
          return {
            v: cellValue !== undefined && cellValue !== null ? cellValue : "",
            s: dataStyle
          };
        });
        wsData.push(styledRow);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      const mergeCols = Math.max(numCols || 5, 5); 
      if (!ws['!merges']) ws['!merges'] = [];
      for (let i = 0; i < 4; i++) {
         ws['!merges'].push({ s: { r: i, c: 0 }, e: { r: i, c: mergeCols - 1 } });
      }

      const colWidths = [];
      for (let i = 0; i < mergeCols; i++) colWidths.push({ wch: 18 });
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, tabName.substring(0, 31));
    });

    XLSX.writeFile(wb, filename);
  } catch (err) {
    console.error("Export Error:", err);
    alert("Failed to export to XLSX. Please check your connection or try again.");
  }
};

export const generateId = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);

export const createEmptyRow = (tab, defaultDate, defaultBagSize = '50kgs', defaultWarehouse = 'NFA ECHAGUE') => {
  const id = generateId();
  const today = new Date();
  const date = defaultDate || `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  switch (tab) {
    case TABS.PURCHASE: 
      return { id, date, truckscaleControlNo: '', supplier: '', address: '', idNo: '', areaHarvested: 0, variety: '', bags: 0, weight: 0, price: 0, total: 0 };
    case TABS.TRANSFER: 
      return { id, date, truckscaleControlNo: '', fromWarehouse: defaultWarehouse, toFacility: '', item: '', bags: 0, netWeight: 0 };
    case TABS.PRODUCTION: 
      return { id, date, batchNo: '', inputPalay: 0, bagSize: defaultBagSize, outputBags: 0, outputRice: 0, byproduct: 0, recovery: 0 };
    case TABS.ISSUANCE:
      return { id, date, withdrawalSlipNo: '', destination: '', sectoralGroup: '', item: '', bagSize: defaultBagSize, bags: 0, unitCost: 0, totalAmount: 0, totalWeight: 0 };
    case TABS.BYPRODUCTS:
      return { id, date, batchRef: '', entity: '', responsibleUser: '', action: 'Add (Addition)', riceHull: 0, riceBran: 0, brewer: 0, spoilage: 0, shrinkage: 0, loss: 0, quantity: 0, notes: '' };
    case TABS.OTHERS:
      return { id, date, itemType: 'Palay', particulars: '', bagSize: defaultBagSize, bags: 0, netWeight: 0, action: 'Add' };
    default: 
      return { id };
  }
};

export const getColumns = (bagSizes, warehouses) => ({
    [TABS.PURCHASE]: [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'truckscaleControlNo', label: 'Truckscale Control No.', type: 'text' },
    { key: 'supplier', label: 'Supplier/Farmer', type: 'text' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'idNo', label: 'ID No.', type: 'text' },
    { key: 'areaHarvested', label: 'Area Harvested (ha)', type: 'number' },
    { key: 'variety', label: 'Item/Variety', type: 'text' },
    { key: 'bags', label: 'Bags', type: 'number', sum: true },
    { key: 'weight', label: 'Net Weight (kg)', type: 'number', sum: true },
    { key: 'price', label: 'Price/kg (₱)', type: 'number' },
    { key: 'total', label: 'Total Cost (₱)', type: 'number', sum: true, readOnly: true }
  ],
  [TABS.TRANSFER]: [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'truckscaleControlNo', label: 'Truckscale Control No.', type: 'text' },
    { key: 'fromWarehouse', label: 'Origin Warehouse', type: 'select', options: warehouses },
    { key: 'toFacility', label: 'To (Facility)', type: 'text' },
    { key: 'item', label: 'Item Description', type: 'text' },
    { key: 'bags', label: 'Quantity (Bags)', type: 'number', sum: true },
    { key: 'netWeight', label: 'Net Weight (kg)', type: 'number', sum: true }
  ],
  [TABS.PRODUCTION]: [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'batchNo', label: 'Batch No.', type: 'text' },
    { key: 'inputPalay', label: 'Input Palay (kg)', type: 'number', sum: true },
    { key: 'bagSize', label: 'Bag Size', type: 'select', options: bagSizes },
    { key: 'outputBags', label: 'Output (Bags)', type: 'number', sum: true },
    { key: 'outputRice', label: 'Output Rice (kg)', type: 'number', sum: true, readOnly: true },
    { key: 'byproduct', label: 'Byproduct (kg)', type: 'number', sum: true, readOnly: true },
    { key: 'recovery', label: 'Recovery (%)', type: 'number', sum: true, readOnly: true }
  ],
  [TABS.ISSUANCE]: [
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
  ],
  [TABS.BYPRODUCTS]: [
    { key: 'batchRef', label: 'Batch Reference No.', type: 'text' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'entity', label: 'Entity', type: 'text' },
    { key: 'responsibleUser', label: 'Responsible user', type: 'text' },
    { key: 'action', label: 'Action type', type: 'select', options: ['Add (Addition)', 'Deduct (Release/Sale)'] },
    { key: 'riceHull', label: 'Rice hull (kg)', type: 'number', sum: true },
    { key: 'riceBran', label: 'Rice bran (kg)', type: 'number', sum: true },
    { key: 'brewer', label: 'Brewer (kg)', type: 'number', sum: true },
    { key: 'spoilage', label: 'Spoilage (Yellow Rice) (kg)', type: 'number', sum: true },
    { key: 'shrinkage', label: 'Shrinkage (kg)', type: 'number', sum: true },
    { key: 'loss', label: 'loss (kg)', type: 'number', sum: true },
    { key: 'quantity', label: 'Quantity kg', type: 'number', sum: true, readOnly: true },
    { key: 'notes', label: 'particulars', type: 'text' }
  ],
  [TABS.OTHERS]: [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'itemType', label: 'Item Type', type: 'select', options: ['Palay', 'Milled Rice'] },
    { key: 'particulars', label: 'Particulars', type: 'text' },
    { key: 'bagSize', label: 'Bag Size', type: 'select', options: bagSizes },
    { key: 'netWeight', label: 'Net Weight (kg)', type: 'number', sum: true },
    { key: 'bags', label: 'Quantity (Bags)', type: 'number', sum: true },
    { key: 'action', label: 'Action', type: 'select', options: ['Add', 'Deduct'] }
  ]
});

export const initialSettings = {
  facilityName: "Isabela Rice Processing Complex",
  bagSizes: DEFAULT_BAG_SIZES,
  warehouses: DEFAULT_WAREHOUSES
};

export const migrateSettings = (rawSettings) => {
  if (!rawSettings) return initialSettings;
  const newSettings = { ...initialSettings, ...rawSettings };
  


  if (!rawSettings.bagSizes || rawSettings.bagSizes.length === 0) {
    newSettings.bagSizes = DEFAULT_BAG_SIZES;
  }
  if (!rawSettings.warehouses || rawSettings.warehouses.length === 0) {
    newSettings.warehouses = DEFAULT_WAREHOUSES;
  }
  return newSettings;
};

export const initialData = {
  [TABS.PURCHASE]: [
    { id: generateId(), date: '2023-09-15', truckscaleControlNo: 'TC-1001', supplier: 'Santiago Farmers Coop', address: '', idNo: '', areaHarvested: 0, variety: 'RC-218 Premium', bags: 100, weight: 5000, price: 21.00, total: 105000 },
    { id: generateId(), date: '2026-06-18', truckscaleControlNo: 'TC-1002', supplier: 'Santiago Farmers Coop', address: '', idNo: '', areaHarvested: 0, variety: 'RC-218 Premium', bags: 120, weight: 6000, price: 21.50, total: 129000 },
    { id: generateId(), date: '2026-06-21', truckscaleControlNo: 'TC-1003', supplier: 'Alicia Agri-Corp', address: '', idNo: '', areaHarvested: 0, variety: 'SL-8H Hybrid', bags: 200, weight: 10000, price: 23.00, total: 230000 }
  ],
  [TABS.TRANSFER]: [
    { id: generateId(), date: '2023-09-18', truckscaleControlNo: 'TR-2001', fromWarehouse: 'NFA ECHAGUE', toFacility: 'Dryer Section 1', item: 'Wet Palay', bags: 100, netWeight: 5000 },
    { id: generateId(), date: '2026-06-19', truckscaleControlNo: 'TR-2002', fromWarehouse: 'RAMON WAREHOUSE', toFacility: 'Dryer Section 1', item: 'Wet Palay', bags: 180, netWeight: 9000 },
    { id: generateId(), date: '2026-06-21', truckscaleControlNo: 'TR-2003', fromWarehouse: 'ROXAS WAREHOUSE', toFacility: 'Dryer Section 2', item: 'Wet Palay', bags: 300, netWeight: 15000 }
  ],
  [TABS.PRODUCTION]: [
    { id: generateId(), date: '2023-09-20', batchNo: 'BATCH-001', inputPalay: 5000, bagSize: '50kgs', outputBags: 65, outputRice: 3250, byproduct: 1750, recovery: 65 },
    { id: generateId(), date: '2026-06-20', batchNo: 'BATCH-088', inputPalay: 9000, bagSize: '25kgs', outputBags: 240, outputRice: 6000, byproduct: 3000, recovery: 66.67 },
    { id: generateId(), date: '2026-06-22', batchNo: 'BATCH-089', inputPalay: 10000, bagSize: '50kgs', outputBags: 130, outputRice: 6500, byproduct: 3500, recovery: 65 },
    { id: generateId(), date: '2026-06-22', batchNo: 'BATCH-090', inputPalay: 5000, bagSize: '10kgs', outputBags: 320, outputRice: 3200, byproduct: 1800, recovery: 64 },
    { id: generateId(), date: '2026-06-22', batchNo: 'BATCH-091', inputPalay: 3000, bagSize: '5kgs', outputBags: 380, outputRice: 1900, byproduct: 1100, recovery: 63.33 }
  ],
  [TABS.ISSUANCE]: [
    { id: generateId(), date: '2023-09-22', withdrawalSlipNo: 'WS-001', destination: 'Cauayan Trading Post', sectoralGroup: 'Trade', item: 'Premium Milled', bagSize: '50kgs', bags: 60, unitCost: 1200, totalAmount: 72000, totalWeight: 3000 },
    { id: generateId(), date: '2026-06-20', withdrawalSlipNo: 'WS-002', destination: 'Cauayan Trading Post', sectoralGroup: 'Trade', item: 'Premium Milled', bagSize: '25kgs', bags: 200, unitCost: 650, totalAmount: 130000, totalWeight: 5000 },
    { id: generateId(), date: '2026-06-22', withdrawalSlipNo: 'WS-003', destination: 'NFA Isabela Depot', sectoralGroup: 'Government', item: 'Milled Sinandomeng', bagSize: '50kgs', bags: 100, unitCost: 1150, totalAmount: 115000, totalWeight: 5000 },
    { id: generateId(), date: '2026-06-22', withdrawalSlipNo: 'WS-004', destination: 'Manila Retailer Hub', sectoralGroup: 'Retail', item: 'Fancy Rice', bagSize: '10kgs', bags: 150, unitCost: 450, totalAmount: 67500, totalWeight: 1500 },
    { id: generateId(), date: '2026-06-22', withdrawalSlipNo: 'WS-005', destination: 'Local Cooperatives', sectoralGroup: 'Cooperative', item: 'Premium Milled', bagSize: '5kgs', bags: 300, unitCost: 240, totalAmount: 72000, totalWeight: 1500 }
  ],
  [TABS.BYPRODUCTS]: [
    { id: generateId(), batchRef: 'REF-001', date: '2026-06-15', entity: 'Biomass Facility', responsibleUser: 'John', action: 'Deduct (Release/Sale)', riceHull: 2000, riceBran: 0, brewer: 0, spoilage: 0, shrinkage: 0, loss: 0, quantity: 2000, notes: 'Direct sale' },
    { id: generateId(), batchRef: 'REF-002', date: '2026-06-18', entity: 'Alicia Feeds', responsibleUser: 'Doe', action: 'Deduct (Release/Sale)', riceHull: 0, riceBran: 1500, brewer: 0, spoilage: 0, shrinkage: 0, loss: 0, quantity: 1500, notes: 'Supplied animal feeds' },
    { id: generateId(), batchRef: 'REF-003', date: '2026-06-21', entity: 'Sieving Team', responsibleUser: 'Jane', action: 'Add (Addition)', riceHull: 0, riceBran: 0, brewer: 0, spoilage: 500, shrinkage: 0, loss: 0, quantity: 500, notes: 'Correction recovery' },
    { id: generateId(), batchRef: 'REF-004', date: '2026-06-22', entity: 'Silo Management', responsibleUser: 'Mark', action: 'Add (Addition)', riceHull: 0, riceBran: 0, brewer: 0, spoilage: 0, shrinkage: 100, loss: 0, quantity: 100, notes: 'Moisture calibration' }
  ],
  [TABS.OTHERS]: [
    { id: generateId(), date: '2026-06-10', itemType: 'Palay', particulars: 'Adjustment from weighbridge recalibration', bagSize: '50kgs', bags: 0, netWeight: 50, action: 'Add' },
    { id: generateId(), date: '2026-06-12', itemType: 'Milled Rice', particulars: 'Samples for DOST analysis', bagSize: '5kgs', bags: 0, netWeight: 15, action: 'Deduct' }
  ]
};
