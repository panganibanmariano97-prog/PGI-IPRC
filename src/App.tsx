// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { AlertTriangle, Wheat, Cloud, CloudOff, RefreshCw, UserCircle, LogOut, BarChart3, ClipboardList, ShoppingCart, ArrowRightLeft, Factory, Truck, Scale, Archive, Settings, Download } from 'lucide-react';
import { ROLES, TABS, ROLE_PERMISSIONS, DEFAULT_BAG_SIZES, DEFAULT_WAREHOUSES, BYPRODUCT_CATEGORIES, getColumns, getTimeframeStr, formatToMMDDYYYY, fmtCost, fmtPct, fmtQty, exportToStyledXLSX, initialData, initialSettings, migrateSettings, createEmptyRow, getBagWeight } from './utils';
import { Login, FilterToolbar, DataGrid, SettingsPanel, DuplicateModal, TransactionModal } from './components';
import { InventoryReportView, DashboardView, ProductionDashboardView, ByproductDashboardView } from './views';

declare var __firebase_config: any;
declare var __app_id: any;
declare var __initial_auth_token: any;

const FORCE_OFFLINE = false;

import { app, auth, db, analytics } from './firebase';
const appId = 'pgi-irpc';


export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('');
  
  const getInitialData = () => {
    const local = localStorage.getItem('isabelaData');
    return local ? JSON.parse(local) : initialData;
  };
  const getInitialSettings = () => {
    const local = localStorage.getItem('isabelaSettings');
    return migrateSettings(local ? JSON.parse(local) : initialSettings);
  };

  const [data, setData] = useState(getInitialData);
  const [settings, setSettings] = useState(getInitialSettings);

  const [fbUser, setFbUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState('offline');

  const now = new Date();
  const currentYYYY = now.getFullYear().toString();
  const currentMM = (now.getMonth() + 1).toString().padStart(2, '0');

  const [timeframe, setTimeframe] = useState('overall'); 
  const [selectedMonth, setSelectedMonth] = useState(`${currentYYYY}-${currentMM}`);
  const [selectedYear, setSelectedYear] = useState(currentYYYY);
  const [selectedBagSize, setSelectedBagSize] = useState('All'); 
  const [selectedWarehouse, setSelectedWarehouse] = useState('All'); 
  const [selectedByproductCategory, setSelectedByproductCategory] = useState('All');
  const [selectedItemType, setSelectedItemType] = useState('All');
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [txDuplicateError, setTxDuplicateError] = useState(null);
  const [txModal, setTxModal] = useState({ isOpen: false, row: null, tab: null, isEdit: false });

  const duplicates = useMemo(() => {
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
  }, [data]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'isabelaData' && e.newValue) {
        try {
          setData(JSON.parse(e.newValue));
        } catch (err) {
          console.error("Failed to sync data from other tab", err);
        }
      }
      if (e.key === 'isabelaSettings' && e.newValue) {
        try {
          setSettings(migrateSettings(JSON.parse(e.newValue)));
        } catch (err) {
          console.error("Failed to sync settings from other tab", err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleExportExcel = () => {
    if (activeTab === TABS.DASHBOARD || activeTab === TABS.SETTINGS) return;

    const columns = getColumns(settings.bagSizes || DEFAULT_BAG_SIZES, settings.warehouses || DEFAULT_WAREHOUSES)[activeTab] || [];
    const currentData = filteredData[activeTab] || [];
    const tabName = tabLabels[activeTab];
    const timeframeStr = getTimeframeStr(timeframe, selectedMonth, selectedYear);

    const dataRows = [];
    
    dataRows.push(columns.map(col => col.label));

    currentData.forEach(row => {
      const rowData = columns.map(col => {
        let val = row[col.key];
        if (val === undefined || val === null) val = "";
        
        if (col.type === 'date' && val) {
           val = formatToMMDDYYYY(val);
        }

        if (activeTab === TABS.PURCHASE && col.key === 'total') {
          val = (parseFloat(row.weight) || 0) * (parseFloat(row.price) || 0);
        } else if (activeTab === TABS.PRODUCTION && col.key === 'outputRice') {
          val = (parseFloat(row.outputBags) || 0) * getBagWeight(row.bagSize);
        } else if (activeTab === TABS.PRODUCTION && col.key === 'byproduct') {
          const outR = (parseFloat(row.outputBags) || 0) * getBagWeight(row.bagSize);
          val = Math.max(0, (parseFloat(row.inputPalay) || 0) - outR);
        } else if (activeTab === TABS.PRODUCTION && col.key === 'recovery') {
          const outR = (parseFloat(row.outputBags) || 0) * getBagWeight(row.bagSize);
          const inP = parseFloat(row.inputPalay) || 0;
          val = inP > 0 ? (outR / inP) * 100 : 0;
        } else if (activeTab === TABS.ISSUANCE && col.key === 'totalWeight') {
          val = (parseFloat(row.bags) || 0) * getBagWeight(row.bagSize);
        } else if (activeTab === TABS.ISSUANCE && col.key === 'totalAmount') {
          val = (parseFloat(row.bags) || 0) * (parseFloat(row.unitCost) || 0);
        }

        if (col.type === 'number' || ['total', 'outputRice', 'byproduct', 'recovery', 'totalWeight', 'totalAmount'].includes(col.key)) {
          if (['price', 'total', 'unitCost', 'totalAmount'].includes(col.key)) {
            return fmtCost(val);
          } else if (col.key === 'recovery') {
            return fmtPct(val);
          } else {
            return fmtQty(val);
          }
        }

        return val;
      });
      dataRows.push(rowData);
    });

    const sums = columns.map((col, index) => {
      if (col.sum) {
        if (activeTab === TABS.PRODUCTION && col.key === 'recovery') {
          let totalInput = 0;
          let totalOutputRice = 0;
          currentData.forEach(r => {
            const inPalay = parseFloat(r.inputPalay) || 0;
            const outBags = parseFloat(r.outputBags) || 0;
            const bagSizeKg = getBagWeight(r.bagSize);
            totalInput += inPalay;
            totalOutputRice += (outBags * bagSizeKg);
          });
          const avgRec = totalInput > 0 ? (totalOutputRice / totalInput) * 100 : 0;
          return fmtPct(avgRec);
        }

        const sumVal = currentData.reduce((acc, r) => {
          let v = 0;
          if (col.key === 'quantity' && r.action?.includes('Deduct')) {
            v = -parseFloat(r[col.key]) || 0;
          } else if (activeTab === TABS.OTHERS && (col.key === 'netWeight' || col.key === 'bags')) {
            const rowVal = parseFloat(r[col.key]) || 0;
            v = r.action === 'Deduct' ? -rowVal : rowVal;
          } else {
            let rowVal = r[col.key];
            if (activeTab === TABS.PURCHASE && col.key === 'total') {
              rowVal = (parseFloat(r.weight) || 0) * (parseFloat(r.price) || 0);
            } else if (activeTab === TABS.PRODUCTION && col.key === 'outputRice') {
              rowVal = (parseFloat(r.outputBags) || 0) * getBagWeight(r.bagSize);
            } else if (activeTab === TABS.PRODUCTION && col.key === 'byproduct') {
              const outR = (parseFloat(r.outputBags) || 0) * getBagWeight(r.bagSize);
              rowVal = Math.max(0, (parseFloat(r.inputPalay) || 0) - outR);
            } else if (activeTab === TABS.ISSUANCE && col.key === 'totalWeight') {
              rowVal = (parseFloat(r.bags) || 0) * getBagWeight(r.bagSize);
            } else if (activeTab === TABS.ISSUANCE && col.key === 'totalAmount') {
              rowVal = (parseFloat(r.bags) || 0) * (parseFloat(r.unitCost) || 0);
            }
            v = parseFloat(rowVal) || 0;
          }
          return acc + v;
        }, 0);
        
        if (['price', 'total', 'unitCost', 'totalAmount'].includes(col.key)) {
          return fmtCost(sumVal);
        } else {
          return fmtQty(sumVal);
        }
      }
      if (index === 0) return 'TOTAL SUM';
      return '';
    });
    dataRows.push(sums);

    exportToStyledXLSX([{
      tabName: tabName,
      facilityName: settings.facilityName,
      reportKind: `${tabName} REPORT`,
      timeframeStr: timeframeStr,
      dataRows: dataRows,
      numCols: columns.length
    }], `${tabName.replace(/\s+/g, '_')}_Report.xlsx`);
  };

  useEffect(() => {
    if (!auth) return;
    let unsubscribeUser = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setFbUser(u);
      if (u) {
        setCloudStatus('connected');
        const userDocRef = doc(db, 'users', u.uid);
        unsubscribeUser = onSnapshot(userDocRef, (userDocSnap) => {
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUser({ id: u.uid, role: userData.role, label: userData.label, username: u.email });
            const availableTabs = ROLE_PERMISSIONS[userData.role] || [];
            setActiveTab(prev => prev ? prev : availableTabs[0]);
          }
        }, (e) => {
          console.error("Failed to fetch user profile", e);
        });
      } else {
        setUser(null);
        setCloudStatus('offline');
        if (unsubscribeUser) unsubscribeUser();
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  useEffect(() => {
    if (!fbUser || !db) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'isabela_inventory', 'state');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const cloudState = docSnap.data();
        if (cloudState.data) {
          setData(cloudState.data);
          localStorage.setItem('isabelaData', JSON.stringify(cloudState.data));
        }
        if (cloudState.settings) {
          const migratedSettings = migrateSettings(cloudState.settings);
          setSettings(migratedSettings);
          localStorage.setItem('isabelaSettings', JSON.stringify(migratedSettings));
        }
      }
    }, (error) => {
      console.error("Cloud Sync Error:", error);
      setCloudStatus('error');
    });
    return () => unsubscribe();
  }, [fbUser]);

  const syncCloudState = async (newData, newSettings = settings) => {
    const migratedSettings = migrateSettings(newSettings);
    setData(newData);
    setSettings(migratedSettings);
    
    localStorage.setItem('isabelaData', JSON.stringify(newData));
    localStorage.setItem('isabelaSettings', JSON.stringify(migratedSettings));
    
    if (!fbUser || !db) return;
    
    setIsSyncing(true);
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'isabela_inventory', 'state');
    try {
      await setDoc(docRef, { data: newData, settings: migratedSettings }, { merge: true });
    } catch (e) {
      console.error("Failed to push to cloud:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualRestore = (restoredData, restoredSettings) => {
    syncCloudState(restoredData, restoredSettings);
  };

  const availableOptions = useMemo(() => {
    const startYear = 2023;
    const startMonth = 9; 
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; 

    const years = [];
    for (let y = currentYear; y >= startYear; y--) {
      years.push(y.toString());
    }

    const months = [];
    for (let y = currentYear; y >= startYear; y--) {
      const startM = (y === startYear) ? startMonth : 1;
      const endM = (y === currentYear) ? currentMonth : 12;
      for (let m = endM; m >= startM; m--) {
        const monthStr = m < 10 ? `0${m}` : `${m}`;
        months.push(`${y}-${monthStr}`);
      }
    }
    return { years, months };
  }, []);



  const handleDataUpdate = (tab, rowId, field, value) => {
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
      
      const normalized = String(value).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (normalized) {
         const isDuplicate = tabData.some(r => {
           if (r.id === rowId) return false;
           const rVal = r[checkKey];
           if (rVal === undefined || rVal === null || rVal === '') return false;
           return String(rVal).replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === normalized;
         });
         
         if (isDuplicate) {
            setTxDuplicateError([{ tab, label: checkLabel, original: value, count: 2 }]);
            return;
         }
      }
    }

    const row = { ...tabData[rowIndex] };

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

    if (tab === TABS.PURCHASE) {
      if (field === 'weight' || field === 'price') {
        const w = parseFloat(row.weight) || 0;
        const p = parseFloat(row.price) || 0;
        row.total = w * p;
      }
    }

    if (tab === TABS.PRODUCTION) {
      if (field === 'outputBags' || field === 'bagSize' || field === 'inputPalay') {
        const sizeKg = getBagWeight(row.bagSize);
        const bags = parseFloat(row.outputBags) || 0;
        const inPalay = parseFloat(row.inputPalay) || 0;
        row.outputRice = sizeKg * bags;
        row.byproduct = Math.max(0, inPalay - row.outputRice);
        row.recovery = inPalay > 0 ? ((row.outputRice / inPalay) * 100).toFixed(2) : 0;
      }
    }

    if (tab === TABS.ISSUANCE) {
      if (field === 'bags' || field === 'bagSize' || field === 'unitCost') {
        const sizeKg = getBagWeight(row.bagSize);
        const bags = parseFloat(row.bags) || 0;
        const unitCost = parseFloat(row.unitCost) || 0;
        row.totalWeight = sizeKg * bags;
        row.totalAmount = bags * unitCost;
      }
    }

    if (tab === TABS.BYPRODUCTS) {
      const keys = ['riceHull', 'riceBran', 'brewer', 'spoilage', 'shrinkage', 'loss'];
      if (keys.includes(field)) {
        let total = 0;
        keys.forEach(k => {
          total += parseFloat(row[k]) || 0;
        });
        row.quantity = total;
      }
    }

    if (tab === TABS.TRANSFER) {
      if (field === 'bags' || field === 'netWeight') {
         row[field] = parseFloat(value) || 0;
      }
    }

    if (tab === TABS.OTHERS) {
      if (field === 'bags' || field === 'netWeight') {
         row[field] = parseFloat(value) || 0;
      }
    }

    tabData[rowIndex] = row;
    newData[tab] = tabData;
    syncCloudState(newData);
  };


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
              return;
            }
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
  };

  const handleAddRow = (tab, defaultCategory = null) => {
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

    const newData = { ...data };
    if (!newData[tab]) newData[tab] = [];
    
    const newRow = createEmptyRow(tab, defaultDate, prepopulatedBagSize, defaultDynamicWarehouse);

    newData[tab].push(newRow);
    
    syncCloudState(newData);
  };

  const handleDeleteRow = (tab, rowId) => {
    const newData = { ...data };
    newData[tab] = newData[tab].filter(row => row.id !== rowId);
    syncCloudState(newData);
  };

  const filteredData = useMemo(() => {
    const result = {};
    Object.keys(data).forEach((tab) => {
      result[tab] = data[tab].filter((row) => {
        if (!row.date || row.date.trim() === '') return true;
        
        const [year, month] = row.date.split('-');
        const rowYear = parseInt(year);
        const rowMonth = parseInt(month);
        
        if (rowYear < 2023 || (rowYear === 2023 && rowMonth < 9)) {
          return false;
        }
        
        let matchesTimeframe = true;
        if (timeframe === 'yearly') {
          matchesTimeframe = (year === selectedYear);
        } else if (timeframe === 'monthly') {
          matchesTimeframe = (`${year}-${month}` === selectedMonth);
        }

        if (!matchesTimeframe) return false;

        if (selectedBagSize !== 'All' && (tab === TABS.PRODUCTION || tab === TABS.ISSUANCE)) {
          if (row.bagSize !== selectedBagSize) return false;
        }

        if (selectedWarehouse !== 'All' && tab === TABS.TRANSFER) {
          if (row.fromWarehouse !== selectedWarehouse) return false;
        }


        if (selectedItemType !== 'All' && tab === TABS.OTHERS) {
          if (row.itemType !== selectedItemType) return false;
        }

        return true;
      });

      const sortedTab = result[tab].map((item, index) => ({ item, index }));
      sortedTab.sort((a, b) => {
        const dateA = a.item.date || '';
        const dateB = b.item.date || '';
        if (dateA !== dateB) {
          return dateB.localeCompare(dateA);
        }
        return b.index - a.index;
      });
      result[tab] = sortedTab.map(x => x.item);
    });
    return result;
  }, [data, timeframe, selectedMonth, selectedYear, selectedBagSize, selectedWarehouse, selectedByproductCategory, selectedItemType]);

  if (!user) {
    return <Login />;
  }

  const availableTabs = ROLE_PERMISSIONS[user.role];
  const isReadOnly = user.role === ROLES.OBSERVER || user.role === ROLES.ACCOUNTING;
  const canExport = user.role !== ROLES.OBSERVER;

  const canEditTab = (tab) => {
    if (isReadOnly) return false;
    if (user.role === ROLES.ADMINISTRATOR) return true;
    if (user.role === ROLES.PURCHASE) return tab === TABS.PURCHASE;
    if (user.role === ROLES.PRODUCTION) {
      return [TABS.TRANSFER, TABS.PRODUCTION, TABS.ISSUANCE, TABS.BYPRODUCTS].includes(tab);
    }
    return false;
  };

  const tabIcons = {
    [TABS.DASHBOARD]: <BarChart3 size={18} />,
    [TABS.INVENTORY]: <ClipboardList size={18} />,
    [TABS.PURCHASE]: <ShoppingCart size={18} />,
    [TABS.TRANSFER]: <ArrowRightLeft size={18} />,
    [TABS.PRODUCTION]: <Factory size={18} />,
    [TABS.ISSUANCE]: <Truck size={18} />,
    [TABS.BYPRODUCTS]: <Scale size={18} />,
    [TABS.OTHERS]: <Archive size={18} />,
    [TABS.SETTINGS]: <Settings size={18} />
  };

  const tabLabels = {
    [TABS.DASHBOARD]: 'Overview Dashboard',
    [TABS.INVENTORY]: 'Inventory Report',
    [TABS.PURCHASE]: 'Purchase Entry',
    [TABS.TRANSFER]: 'Transfer to Facility',
    [TABS.PRODUCTION]: 'Production & Milling',
    [TABS.ISSUANCE]: 'Issuance / Delivery',
    [TABS.BYPRODUCTS]: 'Byproduct Ledger',
    [TABS.OTHERS]: 'Others',
    [TABS.SETTINGS]: 'System Config'
  };

  const formatMonthLabel = (monthString) => {
    if (!monthString) return '';
    const [year, month] = monthString.split('-');
    const dateObj = new Date(year, parseInt(month) - 1, 1);
    return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="h-screen h-[100dvh] overflow-hidden bg-[#fdfbf7] flex flex-col font-sans">
            {txModal.isOpen && (
        <TransactionModal
          isOpen={txModal.isOpen}
          title={txModal.isEdit ? `Edit ${txModal.tab} Transaction` : `Add ${txModal.tab} Transaction`}
          columns={getColumns(settings.bagSizes || DEFAULT_BAG_SIZES, settings.warehouses || DEFAULT_WAREHOUSES)[txModal.tab] || []}
          initialData={txModal.row}
          onSave={handleSaveTx}
          onClose={() => setTxModal({ isOpen: false, row: null, tab: null, isEdit: false })}
        />
      )}
      {showDuplicateModal && (
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
      )}
      <header className="bg-emerald-900 border-b-4 border-yellow-500 shadow-md z-10 relative shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-1 rounded shadow-sm w-9 h-9 flex items-center justify-center overflow-hidden">
                <Wheat className="w-full h-full text-yellow-600 p-0.5" />
              </div>
              <div>
                <h1 className="text-md sm:text-lg font-black text-white tracking-wide leading-tight">
                  {settings.facilityName}
                </h1>
                <div className="flex items-center text-[10px] font-bold mt-0.5 opacity-80">
                  {cloudStatus === 'connected' ? (
                    <span className="flex items-center text-emerald-300">
                      {isSyncing ? <RefreshCw size={10} className="mr-1 animate-spin" /> : <Cloud size={10} className="mr-1" />}
                      ENTERPRISE CLOUD SYNC: ACTIVE
                    </span>
                  ) : (
                    <span className="flex items-center text-amber-300">
                      <CloudOff size={10} className="mr-1" />
                      LOCAL MEMORY (OFFLINE)
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-emerald-100 bg-emerald-800 px-3 py-1.5 rounded-full border border-emerald-700 shadow-inner">
                <UserCircle size={16} className="mr-2 text-yellow-500" />
                <span className="text-xs font-semibold mr-2">{user.label || user.name}</span>
                <span className="text-[10px] px-2 py-0.5 bg-yellow-500 text-emerald-900 rounded-full font-bold ml-2">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-full w-full mx-auto p-4 sm:p-6 lg:p-8 overflow-hidden flex flex-col md:flex-row gap-4 md:gap-6">
        <div className="flex flex-col gap-3 shrink-0 w-full md:w-56 lg:w-64 h-auto md:h-full md:overflow-y-auto">
          <div className="flex md:flex-col flex-row space-x-1 md:space-x-0 md:space-y-1 bg-amber-100/50 p-1.5 rounded-xl shadow-inner border border-amber-200 overflow-x-auto md:overflow-x-hidden">
            {availableTabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab !== TABS.TRANSFER && tab !== TABS.PRODUCTION && tab !== TABS.ISSUANCE && tab !== TABS.INVENTORY && tab !== TABS.OTHERS) {
                      setSelectedBagSize('All');
                    }
                    if (tab !== TABS.TRANSFER) {
                      setSelectedWarehouse('All');
                    }
                    if (tab !== TABS.BYPRODUCTS && tab !== TABS.INVENTORY) {
                      setSelectedByproductCategory('All');
                    }
                    if (tab !== TABS.OTHERS) {
                      setSelectedItemType('All');
                    }
                  }}
                  className={`flex items-center px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap md:whitespace-normal text-left ${
                    isActive
                      ? 'bg-white text-emerald-800 shadow-sm border border-amber-300 ring-1 ring-yellow-500'
                      : 'text-emerald-700/70 hover:bg-amber-100 hover:text-emerald-900'
                  }`}
                >
                  <span className={`mr-2 shrink-0 ${isActive ? 'text-yellow-500' : 'text-emerald-600/50'}`}>
                    {tabIcons[tab]}
                  </span>
                  <span>{tabLabels[tab]}</span>
                </button>
              );
            })}
          </div>

          <div className="flex md:flex-col flex-row gap-2 mt-auto">
            {duplicates.length > 0 && (
              <button
                onClick={() => setShowDuplicateModal(true)}
                className="flex items-center justify-center md:justify-start px-4 py-2.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all shadow-sm border border-red-800 shrink-0"
              >
                <AlertTriangle size={14} className="mr-1.5 shrink-0" />
                {duplicates.length} Duplicate{duplicates.length > 1 ? 's' : ''}
              </button>
            )}
            <button 
              onClick={() => signOut(auth)}
              className="flex items-center justify-center md:justify-start px-4 py-2.5 bg-white text-emerald-800 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all shadow-sm border border-amber-300 shrink-0"
            >
              <LogOut size={14} className="mr-1.5 shrink-0" />
              Logout / Exit Session
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl shadow-xl border border-amber-200/60 p-1">
          <div className="bg-amber-50/30 flex-1 overflow-hidden rounded-xl p-4 sm:p-5 flex flex-col">
            <div className="shrink-0 mb-4 flex flex-col sm:flex-row justify-between sm:items-end border-b border-amber-200 pb-3 gap-2">
              <div>
                <h2 className="text-xl font-black text-emerald-900 flex items-center">
                  {tabIcons[activeTab]}
                  <span className="ml-2">{tabLabels[activeTab]}</span>
                </h2>
                <p className="text-xs font-medium text-amber-700 mt-0.5">
                  {activeTab === TABS.DASHBOARD 
                    ? 'Aggregated calculations and custom bag metrics.'
                    : activeTab === TABS.INVENTORY
                      ? 'Detailed periodic inventory balance sheet.'
                    : activeTab === TABS.BYPRODUCTS
                      ? 'Track Rice Hull, Rice Bran, Brewer, Spoilage (Yellow Rice), Shrinkage balances and losses manually.'
                    : activeTab === TABS.OTHERS
                      ? 'Manual stock adjustments, donations, and other external stock movements.'
                      : isReadOnly ? 'Review spreadsheets in read-only mode.' : 'Use Arrow Keys (↑, ↓, ←, →) & Enter inside grids.'
                  }
                </p>
              </div>

              {canExport && activeTab !== TABS.SETTINGS && activeTab !== TABS.DASHBOARD && activeTab !== TABS.INVENTORY && (
                <button
                  onClick={handleExportExcel}
                  className="flex items-center px-4 py-2 bg-emerald-800 text-yellow-400 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
                >
                  <Download size={16} className="mr-1.5" />
                  Export to Excel (.xlsx)
                </button>
              )}
            </div>

            {activeTab !== TABS.SETTINGS && (
              <FilterToolbar 
                timeframe={timeframe}
                setTimeframe={setTimeframe}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                availableOptions={availableOptions}
                formatMonthLabel={formatMonthLabel}
                activeTab={activeTab}
                bagSizes={settings.bagSizes || DEFAULT_BAG_SIZES}
                warehouses={settings.warehouses || DEFAULT_WAREHOUSES}
                selectedBagSize={selectedBagSize}
                setSelectedBagSize={setSelectedBagSize}
                selectedWarehouse={selectedWarehouse}
                setSelectedWarehouse={setSelectedWarehouse}
                selectedByproductCategory={selectedByproductCategory}
                setSelectedByproductCategory={setSelectedByproductCategory}
              />
            )}

            <div className="flex-1 overflow-auto">
              {activeTab === TABS.SETTINGS ? (
                <SettingsPanel 
                  settings={settings} 
                  onUpdateSettings={(newSettings) => syncCloudState(data, newSettings)} 
                  data={data}
                  onRestoreData={handleManualRestore}
                />
              ) : activeTab === TABS.DASHBOARD ? (
                <DashboardView filteredData={filteredData} bagSizes={settings.bagSizes || DEFAULT_BAG_SIZES} />
              ) : activeTab === TABS.INVENTORY ? (
                <InventoryReportView 
                  data={data}
                  timeframe={timeframe}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  selectedBagSize={selectedBagSize}
                  selectedByproductCategory={selectedByproductCategory}
                  settings={settings}
                  formatMonthLabel={formatMonthLabel}
                  canExport={canExport}
                />
              ) : activeTab === TABS.PRODUCTION ? (
                <ProductionDashboardView
                  filteredData={filteredData}
                  columns={getColumns(settings.bagSizes || DEFAULT_BAG_SIZES, settings.warehouses || DEFAULT_WAREHOUSES)[TABS.PRODUCTION]}
                  onUpdate={handleDataUpdate}
                  onAddRow={canEditTab(TABS.PRODUCTION) ? () => handleOpenAddModal(TABS.PRODUCTION) : undefined}
                  onEditRow={canEditTab(TABS.PRODUCTION) ? (row) => handleOpenEditModal(TABS.PRODUCTION, row) : undefined}
                  onDeleteRow={canEditTab(TABS.PRODUCTION) ? (rowId) => handleDeleteRow(TABS.PRODUCTION, rowId) : undefined}
                  readOnly={!canEditTab(TABS.PRODUCTION)}
                  bagSizes={settings.bagSizes || DEFAULT_BAG_SIZES}
                />
              ) : activeTab === TABS.BYPRODUCTS ? (
                <ByproductDashboardView 
                  filteredData={filteredData} 
                  columns={getColumns(settings.bagSizes || DEFAULT_BAG_SIZES, settings.warehouses || DEFAULT_WAREHOUSES)[TABS.BYPRODUCTS]}
                  onUpdate={handleDataUpdate}
                  onAddRow={canEditTab(TABS.BYPRODUCTS) ? () => handleOpenAddModal(TABS.BYPRODUCTS) : undefined}
                  onEditRow={canEditTab(TABS.BYPRODUCTS) ? (row) => handleOpenEditModal(TABS.BYPRODUCTS, row) : undefined}
                  onDeleteRow={canEditTab(TABS.BYPRODUCTS) ? (rowId) => handleDeleteRow(TABS.BYPRODUCTS, rowId) : undefined}
                  userRole={user.role}
                />
              ) : (
                <DataGrid
                  columns={getColumns(settings.bagSizes || DEFAULT_BAG_SIZES, settings.warehouses || DEFAULT_WAREHOUSES)[activeTab] || []}
                  data={filteredData[activeTab] || []}
                  readOnly={!canEditTab(activeTab)}
                  onUpdate={(rowId, field, value) => handleDataUpdate(activeTab, rowId, field, value)}
                  onAddRow={canEditTab(activeTab) ? () => handleOpenAddModal(activeTab) : undefined}
                  onEditRow={canEditTab(activeTab) ? (row) => handleOpenEditModal(activeTab, row) : undefined}
                  onDeleteRow={canEditTab(activeTab) ? (rowId) => handleDeleteRow(activeTab, rowId) : undefined}
                />
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
