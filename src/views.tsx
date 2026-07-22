import { collection, query, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore';
// @ts-nocheck
import React, { useMemo, useState, useEffect } from 'react';
import { UserCircle, RefreshCw, ClipboardList, Download, Factory, Plus, ShoppingCart, ArrowRightLeft, Package, Truck, Activity, Scale, Edit2, Trash2, Key, AlertCircle, X, MoreVertical } from 'lucide-react';
import { TABS, getBagWeight, formatToMMDDYYYY, getTimeframeStr, fmtQty, BYPRODUCT_CATEGORIES, ROLES, exportToStyledXLSX } from './utils';
import { DataGrid } from './components';
import { db, auth } from './firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export const InventoryReportView = ({ data, timeframe, selectedMonth, selectedYear, selectedBagSize, selectedByproductCategory, settings, formatMonthLabel, canExport }) => {
  const metrics = React.useMemo(() => {
    let m = {
      palay: { beg: 0, in: 0, out: 0, end: 0, moves: [] },
      wip: { beg: 0, in: 0, out: 0, outRice: 0, outRiceBags: 0, outByproduct: 0, end: 0, moves: [] },
      rice: { beg: 0, begBags: 0, in: 0, inBags: 0, out: 0, outBags: 0, end: 0, endBags: 0, moves: [] },
      byproducts: {
        beg: { riceHull: 0, riceBran: 0, brewer: 0, spoilage: 0, shrinkage: 0, loss: 0, total: 0 },
        in: { riceHull: 0, riceBran: 0, brewer: 0, spoilage: 0, shrinkage: 0, loss: 0, total: 0 },
        out: { riceHull: 0, riceBran: 0, brewer: 0, spoilage: 0, shrinkage: 0, loss: 0, total: 0 },
        end: { riceHull: 0, riceBran: 0, brewer: 0, spoilage: 0, shrinkage: 0, loss: 0, total: 0 },
        moves: []
      }
    };
    
    // checkDate
    const checkDate = (dateStr) => {
      if (!dateStr) return { isBefore: false, isWithin: true }; 
      const rowMonthStr = dateStr.substring(0, 7);
      const rowYearStr = dateStr.substring(0, 4);
      if (timeframe === 'monthly') {
        return { isBefore: rowMonthStr < selectedMonth, isWithin: rowMonthStr === selectedMonth };
      } else if (timeframe === 'yearly') {
        return { isBefore: rowYearStr < selectedYear, isWithin: rowYearStr === selectedYear };
      }
      return { isBefore: false, isWithin: true }; 
    };

    // processPalayIn
    const processPalayIn = (r, typeDesc) => {
      const { isBefore, isWithin } = checkDate(r.date);
      const val = parseFloat(r.weight) || 0;
      if (isBefore) m.palay.beg += val;
      if (isWithin) {
        m.palay.in += val;
        m.palay.moves.push({ id: r.id, date: r.date, type: typeDesc, desc: `Supplier/Farmer: ${r.supplier}`, in: val, out: 0 });
      }
    };

    (data[TABS.PURCHASE] || []).forEach(r => processPalayIn(r, 'Purchase'));

    (data[TABS.TRANSFER] || []).forEach(r => {
      const { isBefore, isWithin } = checkDate(r.date);
      const val = parseFloat(r.netWeight) || 0;
      if (isBefore) { m.palay.beg -= val; m.wip.beg += val; }
      if (isWithin) { 
        m.palay.out += val; 
        m.wip.in += val;
        m.palay.moves.push({ id: r.id, date: r.date, type: 'Transfer to Milling', desc: `TC No: ${r.truckscaleControlNo || ''}`, in: 0, out: val });
        m.wip.moves.push({ id: r.id, date: r.date, type: 'Transfer In', desc: `TC No: ${r.truckscaleControlNo || ''}`, in: val, outRice: 0, outRiceBags: 0, outByproduct: 0 });
      }
    });

    (data[TABS.PRODUCTION] || []).forEach(r => {
      const { isBefore, isWithin } = checkDate(r.date);
      const isMilledRice = true;
      const bagSize = r.bagSize || '50kgs';
      const bags = parseFloat(r.outputBags) || 0;
      const totalRiceWeight = bags * getBagWeight(bagSize);
      
      const inputPalay = parseFloat(r.inputPalay) || 0;
      const outputRice = parseFloat(r.outputRice) || 0;
      const byproductVal = Math.max(0, inputPalay - outputRice);

      let includeInRice = true;
      if (selectedBagSize !== 'All' && bagSize !== selectedBagSize) includeInRice = false;

if (isBefore) {
        if (includeInRice) {
          m.wip.beg -= inputPalay;
          m.rice.beg += totalRiceWeight; 
          m.rice.begBags += bags; 
        }
      }
      if (isWithin) {
        if (includeInRice) {
          m.wip.outRice += outputRice;
          m.wip.outRiceBags += bags;
          m.wip.outByproduct += byproductVal;
          m.wip.moves.push({ id: r.id, date: r.date, type: 'Production Output', desc: `Batch: ${r.batchNo || ''} (${bagSize})`, in: 0, outRice: outputRice, outRiceBags: bags, outByproduct: byproductVal });
              
          m.rice.in += totalRiceWeight;
          m.rice.inBags += bags;
          m.rice.moves.push({ id: r.id, date: r.date, type: 'Production Output', desc: `Batch: ${r.batchNo || ''} (${bagSize})`, in: totalRiceWeight, out: 0, inBags: bags, outBags: 0 });
        }
      }
    });

    (data[TABS.ISSUANCE] || []).forEach(r => {
      const { isBefore, isWithin } = checkDate(r.date);
      const bagSize = r.bagSize || '50kgs';
      const bags = parseFloat(r.bags) || 0;
      const weight = bags * getBagWeight(bagSize);
      let includeInRice = true;
      if (selectedBagSize !== 'All' && bagSize !== selectedBagSize) includeInRice = false;

      if (isBefore) {
        if (includeInRice) { m.rice.beg -= weight; m.rice.begBags -= bags; }
      }
      if (isWithin) {
        if (includeInRice) {
          m.rice.out += weight;
          m.rice.outBags += bags;
          m.rice.moves.push({ id: r.id, date: r.date, type: 'Issuance/Dispatch', desc: `Client: ${r.destination} (${bagSize})`, in: 0, out: weight, inBags: 0, outBags: bags });
        }
      }
    });

    (data[TABS.OTHERS] || []).forEach(r => {
      const { isBefore, isWithin } = checkDate(r.date);
      const itemType = r.itemType;
      const bagSize = r.bagSize || '50kgs';
      const bags = parseFloat(r.bags) || 0;
      const weight = parseFloat(r.netWeight) || (bags * getBagWeight(bagSize)) || 0;
      const isAdd = r.action?.includes('Add');

      if (itemType === 'Palay') {
        if (isBefore) {
          if (isAdd) m.palay.beg += weight; else m.palay.beg -= weight;
        }
        if (isWithin) {
          if (isAdd) { m.palay.in += weight; m.palay.moves.push({ id: r.id, date: r.date, type: 'Other Addition', desc: r.particulars, in: weight, out: 0 }); }
          else { m.palay.out += weight; m.palay.moves.push({ id: r.id, date: r.date, type: 'Other Deduction', desc: r.particulars, in: 0, out: weight }); }
        }
      } else if (itemType === 'Milled Rice') {
        let includeInRice = true;
        if (selectedBagSize !== 'All' && bagSize !== selectedBagSize) includeInRice = false;
        if (includeInRice) {
          if (isBefore) {
            if (isAdd) { m.rice.beg += weight; m.rice.begBags += bags; } else { m.rice.beg -= weight; m.rice.begBags -= bags; }
          }
          if (isWithin) {
            if (isAdd) { 
              m.rice.in += weight; m.rice.inBags += bags; 
              m.rice.moves.push({ id: r.id, date: r.date, type: 'Other Addition', desc: r.particulars, in: weight, out: 0, inBags: bags, outBags: 0 }); 
            } else { 
              m.rice.out += weight; m.rice.outBags += bags; 
              m.rice.moves.push({ id: r.id, date: r.date, type: 'Other Deduction', desc: r.particulars, in: 0, out: weight, inBags: 0, outBags: bags }); 
            }
          }
        }
      }
    });

    (data[TABS.BYPRODUCTS] || []).forEach(r => {
      const { isBefore, isWithin } = checkDate(r.date);
      const isAdd = r.action?.includes('Add');
      const desc = r.entity ? ` - ${r.entity}` : '';
      const rh = parseFloat(r.riceHull) || 0;
      const rb = parseFloat(r.riceBran) || 0;
      const br = parseFloat(r.brewer) || 0;
      const sp = parseFloat(r.spoilage) || 0;
      const sh = parseFloat(r.shrinkage) || 0;
      const ls = parseFloat(r.loss) || 0;
      const total = rh + rb + br + sp + sh + ls;
      
      if (isBefore) {
        if (isAdd) {
          m.byproducts.beg.riceHull += rh; m.byproducts.beg.riceBran += rb; m.byproducts.beg.brewer += br;
          m.byproducts.beg.spoilage += sp; m.byproducts.beg.shrinkage += sh; m.byproducts.beg.loss += ls; m.byproducts.beg.total += total;
        } else {
          m.byproducts.beg.riceHull -= rh; m.byproducts.beg.riceBran -= rb; m.byproducts.beg.brewer -= br;
          m.byproducts.beg.spoilage -= sp; m.byproducts.beg.shrinkage -= sh; m.byproducts.beg.loss -= ls; m.byproducts.beg.total -= total;
        }
      }
      
      if (isWithin) {
        if (isAdd) {
          m.byproducts.in.riceHull += rh; m.byproducts.in.riceBran += rb; m.byproducts.in.brewer += br;
          m.byproducts.in.spoilage += sp; m.byproducts.in.shrinkage += sh; m.byproducts.in.loss += ls; m.byproducts.in.total += total;
          m.byproducts.moves.push({ id: r.id, batchRef: r.batchRef, date: r.date, type: 'Addition', desc, in: { riceHull: rh, riceBran: rb, brewer: br, spoilage: sp, shrinkage: sh, loss: ls, total }, out: { riceHull: 0, riceBran: 0, brewer: 0, spoilage: 0, shrinkage: 0, loss: 0, total: 0 } });
        } else {
          m.byproducts.out.riceHull += rh; m.byproducts.out.riceBran += rb; m.byproducts.out.brewer += br;
          m.byproducts.out.spoilage += sp; m.byproducts.out.shrinkage += sh; m.byproducts.out.loss += ls; m.byproducts.out.total += total;
          m.byproducts.moves.push({ id: r.id, batchRef: r.batchRef, date: r.date, type: 'Release', desc, in: { riceHull: 0, riceBran: 0, brewer: 0, spoilage: 0, shrinkage: 0, loss: 0, total: 0 }, out: { riceHull: rh, riceBran: rb, brewer: br, spoilage: sp, shrinkage: sh, loss: ls, total } });
        }
      }
    });

    const processByproductMoves = (movesArray, startBal) => {
      movesArray.sort((a, b) => a.date.localeCompare(b.date));
      let current = { ...startBal };
      movesArray.forEach(m => {
        const keys = ['riceHull', 'riceBran', 'brewer', 'spoilage', 'shrinkage', 'loss', 'total'];
        m.balance = {};
        keys.forEach(k => {
           current[k] += (m.in[k] || 0) - (m.out[k] || 0);
           m.balance[k] = current[k];
        });
      });
    };

    const processMoves = (movesArray, startBal, startBalBags = null, isWip = false) => {
      movesArray.sort((a, b) => a.date.localeCompare(b.date));
      let current = startBal;
      let currentBags = startBalBags !== null ? startBalBags : 0;
      movesArray.forEach(m => {
        if (isWip) {
          current = current + (m.in || 0) - (m.outRice || 0) - (m.outByproduct || 0);
        } else {
          current = current + (m.in || 0) - (m.out !== undefined ? m.out : 0);
        }
        m.balance = current;
        if (startBalBags !== null) {
          currentBags = currentBags + (m.inBags || 0) - (m.outBags || 0);
          m.balanceBags = currentBags;
        }
      });
    };

    processMoves(m.palay.moves, m.palay.beg);
    processMoves(m.wip.moves, m.wip.beg, null, true);
    processMoves(m.rice.moves, m.rice.beg, m.rice.begBags);
    processByproductMoves(m.byproducts.moves, m.byproducts.beg);

    m.palay.end = m.palay.beg + m.palay.in - m.palay.out;
    m.wip.end = m.wip.beg + m.wip.in - m.wip.outRice - m.wip.outByproduct;
    m.rice.end = m.rice.beg + m.rice.in - m.rice.out;
    m.rice.endBags = m.rice.begBags + m.rice.inBags - m.rice.outBags;

    const keys = ['riceHull', 'riceBran', 'brewer', 'spoilage', 'shrinkage', 'loss', 'total'];
    keys.forEach(k => {
      m.byproducts.end[k] = m.byproducts.beg[k] + m.byproducts.in[k] - m.byproducts.out[k];
    });

    return m;
  }, [data, timeframe, selectedMonth, selectedYear, selectedBagSize, selectedByproductCategory]);

  const getBeginningDateString = () => {
    if (timeframe === 'monthly') return formatToMMDDYYYY(`${selectedMonth}-01`);
    if (timeframe === 'yearly') return formatToMMDDYYYY(`${selectedYear}-01-01`);
    return '--';
  };
  const beginningDateStr = getBeginningDateString();

  const handleExport = () => {
    const timeframeStr = getTimeframeStr(timeframe, selectedMonth, selectedYear);
    const summaryRows = [];
    if (selectedBagSize !== 'All') summaryRows.push([`Filter: Bag Size = ${selectedBagSize}`]);
    summaryRows.push(["Inventory Category Summary", "Beginning Balance", "Additions (In)", "Deductions (Out)", "Ending Balance"]);
    summaryRows.push(["Raw Palay (Warehouse) (kg)", fmtQty(metrics.palay.beg), fmtQty(metrics.palay.in), fmtQty(metrics.palay.out), fmtQty(metrics.palay.end)]);
    summaryRows.push(["WIP Palay (Milling Facility) (kg)", fmtQty(metrics.wip.beg), fmtQty(metrics.wip.in), fmtQty(metrics.wip.outRice + metrics.wip.outByproduct), fmtQty(metrics.wip.end)]);
    summaryRows.push(["Milled Rice (Finished Goods) (Bags)", fmtQty(metrics.rice.begBags), fmtQty(metrics.rice.inBags), fmtQty(metrics.rice.outBags), fmtQty(metrics.rice.endBags)]);
    summaryRows.push([`Consolidated Byproduct (kg)`, fmtQty(metrics.byproducts.beg.total), fmtQty(metrics.byproducts.in.total), fmtQty(metrics.byproducts.out.total), fmtQty(metrics.byproducts.end.total)]);

    const palayRows = [["Date", "Action / Reference", "Additions (In) (kg)", "Deductions (Out) (kg)", "Running Balance (kg)"]];
    metrics.palay.moves.forEach(m => palayRows.push([formatToMMDDYYYY(m.date), `${m.type} - ${m.desc || ''}`, fmtQty(m.in), fmtQty(m.out), fmtQty(m.balance)]));
    
    const wipRows = [["Date", "Action / Reference", "Additions (In) (kg)", "Deductions (Out) (kg)", "Deductions (Out) (Bags)", "Byproduct (Out) (kg)", "Running Balance (kg)"]];
    metrics.wip.moves.forEach(m => wipRows.push([formatToMMDDYYYY(m.date), `${m.type} - ${m.desc || ''}`, fmtQty(m.in), fmtQty(m.outRice), fmtQty(m.outRiceBags || 0), fmtQty(m.outByproduct), fmtQty(m.balance)]));
    
    const riceRows = [["Date", "Action / Reference", "Additions (In) (Bags)", "Deductions (Out) (Bags)", "Running Balance (Bags)", "Additions (In) (kg)", "Deductions (Out) (kg)", "Running Balance (kg)"]];
    metrics.rice.moves.forEach(m => riceRows.push([formatToMMDDYYYY(m.date), `${m.type} - ${m.desc || ''}`, fmtQty(m.inBags || 0), fmtQty(m.outBags || 0), fmtQty(m.balanceBags || 0), fmtQty(m.in), fmtQty(m.out), fmtQty(m.balance)]));
    
    const sheetsData = [
      { tabName: "Summary", facilityName: settings.facilityName, reportKind: "INVENTORY SUMMARY LEDGER", timeframeStr, dataRows: summaryRows, numCols: 5 },
      { tabName: "Raw Palay", facilityName: settings.facilityName, reportKind: "RAW PALAY INVENTORY LEDGER", timeframeStr, dataRows: palayRows, numCols: 5 },
      { tabName: "WIP Palay", facilityName: settings.facilityName, reportKind: "WIP PALAY INVENTORY LEDGER", timeframeStr, dataRows: wipRows, numCols: 7 },
      { tabName: "Milled Rice", facilityName: settings.facilityName, reportKind: "MILLED RICE INVENTORY LEDGER", timeframeStr, dataRows: riceRows, numCols: 8 }
    ];

    const bypRows = [["Date", "Action / Reference", "Rice Hull (In)", "Rice Hull (Out)", "Rice Bran (In)", "Rice Bran (Out)", "Brewer (In)", "Brewer (Out)", "Spoilage (In)", "Spoilage (Out)", "Shrinkage (In)", "Shrinkage (Out)", "Loss (In)", "Loss (Out)", "Total (In)", "Total (Out)", "Running Balance (Total kg)"]];
    metrics.byproducts.moves.forEach(m => bypRows.push([
      formatToMMDDYYYY(m.date), `${m.type} - ${m.desc || ''}`,
      fmtQty(m.in.riceHull), fmtQty(m.out.riceHull),
      fmtQty(m.in.riceBran), fmtQty(m.out.riceBran),
      fmtQty(m.in.brewer), fmtQty(m.out.brewer),
      fmtQty(m.in.spoilage), fmtQty(m.out.spoilage),
      fmtQty(m.in.shrinkage), fmtQty(m.out.shrinkage),
      fmtQty(m.in.loss), fmtQty(m.out.loss),
      fmtQty(m.in.total), fmtQty(m.out.total),
      fmtQty(m.balance.total)
    ]));
    sheetsData.push({ tabName: "Byproducts Ledger", facilityName: settings.facilityName, reportKind: "CONSOLIDATED BYPRODUCTS LEDGER", timeframeStr, dataRows: bypRows, numCols: 17 });
    
    exportToStyledXLSX(sheetsData, `Inventory_Ledgers_${timeframe}.xlsx`);
  };

  const handleExportSpecific = (type) => {
    const timeframeStr = getTimeframeStr(timeframe, selectedMonth, selectedYear);
    const dataRows = [];
    let title = "";
    let numCols = 5;

    if (type === 'palay') {
      title = 'RAW PALAY INVENTORY LEDGER';
      dataRows.push(["Category Summary"]);
      dataRows.push(["Beginning Balance (kg)", "Additions (In) (kg)", "Deductions (Out) (kg)", "Ending Balance (kg)"]);
      dataRows.push([fmtQty(metrics.palay.beg), fmtQty(metrics.palay.in), fmtQty(metrics.palay.out), fmtQty(metrics.palay.end)]);
      dataRows.push([]);
      dataRows.push(["Detailed Daily Movement Ledger"]);
      dataRows.push(["Date", "Action / Reference", "Additions (In) (kg)", "Deductions (Out) (kg)", "Running Balance (kg)"]);
      metrics.palay.moves.forEach(m => dataRows.push([formatToMMDDYYYY(m.date), `${m.type} - ${m.desc || ''}`, fmtQty(m.in), fmtQty(m.out), fmtQty(m.balance)]));
    } else if (type === 'wip') {
      title = 'WIP PALAY INVENTORY LEDGER';
      numCols = 7;
      dataRows.push(["Category Summary"]);
      dataRows.push(["Beginning Balance (kg)", "Additions (In) (kg)", "Deductions (Out) (kg)", "Deductions (Out) (Bags)", "Byproduct (Out) (kg)", "Ending Balance (kg)"]);
      dataRows.push([fmtQty(metrics.wip.beg), fmtQty(metrics.wip.in), fmtQty(metrics.wip.outRice), fmtQty(metrics.wip.outRiceBags), fmtQty(metrics.wip.outByproduct), fmtQty(metrics.wip.end)]);
      dataRows.push([]);
      dataRows.push(["Detailed Daily Movement Ledger"]);
      dataRows.push(["Date", "Action / Reference", "Additions (In) (kg)", "Deductions (Out) (kg)", "Deductions (Out) (Bags)", "Byproduct (Out) (kg)", "Running Balance (kg)"]);
      metrics.wip.moves.forEach(m => dataRows.push([formatToMMDDYYYY(m.date), `${m.type} - ${m.desc || ''}`, fmtQty(m.in), fmtQty(m.outRice), fmtQty(m.outRiceBags || 0), fmtQty(m.outByproduct), fmtQty(m.balance)]));
    } else if (type === 'rice') {
      title = 'MILLED RICE INVENTORY LEDGER';
      numCols = 8;
      if (selectedBagSize !== 'All') dataRows.push([`Filter: Bag Size = ${selectedBagSize}`]);
      dataRows.push(["Category Summary"]);
      dataRows.push(["Beginning Balance (Bags)", "Additions (In) (Bags)", "Deductions (Out) (Bags)", "Ending Balance (Bags)"]);
      dataRows.push([fmtQty(metrics.rice.begBags), fmtQty(metrics.rice.inBags), fmtQty(metrics.rice.outBags), fmtQty(metrics.rice.endBags)]);
      dataRows.push([]);
      dataRows.push(["Detailed Daily Movement Ledger"]);
      dataRows.push(["Date", "Action / Reference", "Additions (In) (Bags)", "Deductions (Out) (Bags)", "Running Balance (Bags)", "Additions (In) (kg)", "Deductions (Out) (kg)", "Running Balance (kg)"]);
      metrics.rice.moves.forEach(m => dataRows.push([formatToMMDDYYYY(m.date), `${m.type} - ${m.desc || ''}`, fmtQty(m.inBags || 0), fmtQty(m.outBags || 0), fmtQty(m.balanceBags || 0), fmtQty(m.in), fmtQty(m.out), fmtQty(m.balance)]));
    } else if (type === 'byproducts') {
      const showAll = !selectedByproductCategory || selectedByproductCategory === 'All';
      const showRiceHull = showAll || selectedByproductCategory === 'Rice Hull';
      const showRiceBran = showAll || selectedByproductCategory === 'Rice Bran';
      const showBrewer = showAll || selectedByproductCategory === 'Brewer';
      const showSpoilage = showAll || selectedByproductCategory === 'Spoilage (Yellow Rice)';
      const showShrinkage = showAll || selectedByproductCategory === 'Shrinkage';
      const showLoss = showAll || selectedByproductCategory === 'Loss';
      
      title = 'CONSOLIDATED BYPRODUCTS LEDGER';
      
      let headerRow = ["Date", "Action / Reference"];
      if (showRiceHull) headerRow.push("Rice Hull (In)", "Rice Hull (Out)");
      if (showRiceBran) headerRow.push("Rice Bran (In)", "Rice Bran (Out)");
      if (showBrewer) headerRow.push("Brewer (In)", "Brewer (Out)");
      if (showSpoilage) headerRow.push("Spoilage (In)", "Spoilage (Out)");
      if (showShrinkage) headerRow.push("Shrinkage (In)", "Shrinkage (Out)");
      if (showLoss) headerRow.push("Loss (In)", "Loss (Out)");
      headerRow.push("Total (In)", "Total (Out)", "Running Balance (Total kg)");
      
      numCols = headerRow.length;
      
      dataRows.push(["Category Summary"]);
      dataRows.push(["Beginning Balance (kg)", "Additions (In) (kg)", "Deductions (Out) (kg)", "Ending Balance (kg)"]);
      dataRows.push([fmtQty(metrics.byproducts.beg.total), fmtQty(metrics.byproducts.in.total), fmtQty(metrics.byproducts.out.total), fmtQty(metrics.byproducts.end.total)]);
      dataRows.push([]);
      dataRows.push(["Detailed Daily Movement Ledger"]);
      dataRows.push(headerRow);
      metrics.byproducts.moves.filter(move => {
        if (!selectedByproductCategory || selectedByproductCategory === 'All') return true;
        if (selectedByproductCategory === 'Rice Hull') return move.in.riceHull !== 0 || move.out.riceHull !== 0;
        if (selectedByproductCategory === 'Rice Bran') return move.in.riceBran !== 0 || move.out.riceBran !== 0;
        if (selectedByproductCategory === 'Brewer') return move.in.brewer !== 0 || move.out.brewer !== 0;
        if (selectedByproductCategory === 'Spoilage (Yellow Rice)') return move.in.spoilage !== 0 || move.out.spoilage !== 0;
        if (selectedByproductCategory === 'Shrinkage') return move.in.shrinkage !== 0 || move.out.shrinkage !== 0;
        if (selectedByproductCategory === 'Loss') return move.in.loss !== 0 || move.out.loss !== 0;
        return true;
      }).forEach(m => {
        let row = [formatToMMDDYYYY(m.date), `${m.type} - ${m.desc || ''}`];
        if (showRiceHull) row.push(fmtQty(m.in.riceHull), fmtQty(m.out.riceHull));
        if (showRiceBran) row.push(fmtQty(m.in.riceBran), fmtQty(m.out.riceBran));
        if (showBrewer) row.push(fmtQty(m.in.brewer), fmtQty(m.out.brewer));
        if (showSpoilage) row.push(fmtQty(m.in.spoilage), fmtQty(m.out.spoilage));
        if (showShrinkage) row.push(fmtQty(m.in.shrinkage), fmtQty(m.out.shrinkage));
        if (showLoss) row.push(fmtQty(m.in.loss), fmtQty(m.out.loss));
        row.push(fmtQty(m.in.total), fmtQty(m.out.total), fmtQty(m.balance.total));
        dataRows.push(row);
      });
    }

    exportToStyledXLSX([{
      tabName: title.substring(0,31),
      facilityName: settings.facilityName,
      reportKind: title,
      timeframeStr: timeframeStr,
      dataRows: dataRows,
      numCols: numCols
    }], `${title.replace(/ /g, '_')}_${timeframe}.xlsx`);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-amber-200/60 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-amber-100 pb-4 mb-6 gap-4">
        <div>
           <h3 className="font-extrabold text-emerald-900 text-lg flex items-center">
             <ClipboardList className="text-yellow-500 mr-2" size={22} />
             System-Wide Inventory Ledgers
             {selectedBagSize !== 'All' && (
               <span className="ml-3 px-2.5 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] uppercase tracking-wider rounded-full font-bold border border-yellow-300 shadow-sm">
                 Filtered: {selectedBagSize}
               </span>
             )}
           </h3>
           <p className="text-xs font-semibold text-amber-700/80 mt-1">
             Tracks chronological material flow and daily running balances from warehouse to final dispatch.
           </p>
        </div>
        {canExport && (
          <button onClick={handleExport} className="flex items-center px-5 py-2.5 bg-emerald-800 text-yellow-400 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95 whitespace-nowrap">
            <Download size={16} className="mr-2" />
            Export All to Excel (.xlsx)
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
          <div className="bg-emerald-800 px-4 py-3 border-b-4 border-yellow-600 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-yellow-500 text-[15px]">Raw Palay (Warehouse Inventory)</h4>
              <p className="text-[11px] text-emerald-200 font-medium mt-0.5">Tracks un-milled palay sourced from purchases before processing.</p>
            </div>
            {canExport && (
              <button onClick={() => handleExportSpecific('palay')} className="flex items-center px-3 py-1.5 bg-yellow-500 text-emerald-950 rounded text-[10px] font-bold hover:bg-yellow-400 transition-all shadow-sm active:scale-95 whitespace-nowrap">
                <Download size={14} className="mr-1.5" />
                Export .xlsx
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-50 text-emerald-900 text-xs border-b border-amber-200">
                  <th className="p-3 font-semibold border-r border-amber-200 w-[12%]">Date</th>
                  <th className="p-3 font-semibold border-r border-amber-200 w-1/3">Movement Details</th>
                  <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Additions (In)</th>
                  <th className="p-3 font-semibold border-r border-amber-200 text-right text-red-700">Deductions (Out)</th>
                  <th className="p-3 font-semibold text-right text-emerald-900">Running Balance</th>
                </tr>
              </thead>
              <tbody className="text-sm text-emerald-950">
                <tr className="bg-gray-50/50">
                  <td className="p-3 border-r border-amber-100 text-gray-500 text-xs font-semibold text-center font-mono">{beginningDateStr}</td>
                  <td className="p-3 border-r border-amber-100 text-emerald-800 text-xs font-bold">Beginning Balance</td>
                  <td className="p-3 border-r border-amber-100 text-right text-gray-400 font-mono text-xs">--</td>
                  <td className="p-3 border-r border-amber-100 text-right text-gray-400 font-mono text-xs">--</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-900">{metrics.palay.beg.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</td>
                </tr>
                {metrics.palay.moves.map((move, idx) => (
                  <tr key={`palay-${move.id || idx}`} className="hover:bg-amber-50/40 transition-colors border-t border-dashed border-amber-100">
                    <td className="p-3 border-r border-amber-100 font-mono text-xs text-gray-600">{formatToMMDDYYYY(move.date)}</td>
                    <td className="p-3 border-r border-amber-100 text-xs"><span className="font-bold text-amber-800">{move.type}</span> <span className="text-gray-500 ml-2">{move.desc}</span></td>
                    <td className="p-3 border-r border-amber-100 text-right font-mono font-medium text-emerald-700">{move.in > 0 ? `+${move.in.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg` : '-'}</td>
                    <td className="p-3 border-r border-amber-100 text-right font-mono font-medium text-red-700">{move.out > 0 ? `-${move.out.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg` : '-'}</td>
                    <td className="p-3 text-right font-mono font-semibold text-emerald-900">{move.balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</td>
                  </tr>
                ))}
                <tr className="bg-amber-100/50 border-t-2 border-amber-300">
                  <td className="p-3 border-r border-amber-300 text-emerald-900 text-xs font-bold" colSpan={2}>Total Period Summary</td>
                  <td className="p-3 border-r border-amber-300 text-right font-mono font-bold text-emerald-700">+{metrics.palay.in.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</td>
                  <td className="p-3 border-r border-amber-300 text-right font-mono font-bold text-red-700">-{metrics.palay.out.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</td>
                  <td className="p-3 text-right font-mono font-black text-[15px] text-emerald-950">{metrics.palay.end.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
          <div className="bg-amber-800 px-4 py-3 border-b-4 border-amber-50 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-amber-300 text-[15px]">WIP Palay (Milling Facility)</h4>
              <p className="text-[11px] text-amber-100 font-medium mt-0.5">Palay actively being processed. Deductions reflect Milled Rice & Byproducts produced.</p>
            </div>
            {canExport && (
              <button onClick={() => handleExportSpecific('wip')} className="flex items-center px-3 py-1.5 bg-amber-600 text-yellow-100 rounded text-[10px] font-bold hover:bg-amber-500 transition-all shadow-sm active:scale-95 whitespace-nowrap">
                <Download size={14} className="mr-1.5" />
                Export .xlsx
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-50 text-emerald-900 text-xs border-b border-amber-200">
                  <th className="p-3 font-semibold border-r border-amber-200 w-[12%]">Date</th>
                  <th className="p-3 font-semibold border-r border-amber-200 w-1/4">Movement Details</th>
                  <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Additions (In)</th>
                  <th className="p-3 font-semibold border-r border-amber-200 text-right text-red-700">Deductions (Out)</th>
                  <th className="p-3 font-semibold border-r border-amber-200 text-right text-red-700">Deductions (Out) Bags</th>
                  <th className="p-3 font-semibold border-r border-amber-200 text-right text-red-700">Byproduct (Out)</th>
                  <th className="p-3 font-semibold text-right text-emerald-900">Running Balance</th>
                </tr>
              </thead>
              <tbody className="text-sm text-emerald-950">
                <tr className="bg-gray-50/50">
                  <td className="p-3 border-r border-amber-100 text-gray-500 text-xs font-semibold text-center font-mono">{beginningDateStr}</td>
                  <td className="p-3 border-r border-amber-100 text-emerald-800 text-xs font-bold">Beginning Balance</td>
                  <td className="p-3 border-r border-amber-100 text-right text-gray-400 font-mono text-xs">--</td>
                  <td className="p-3 border-r border-amber-100 text-right text-gray-400 font-mono text-xs">--</td>
                  <td className="p-3 border-r border-amber-100 text-right text-gray-400 font-mono text-xs">--</td>
                  <td className="p-3 border-r border-amber-100 text-right text-gray-400 font-mono text-xs">--</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-900">{metrics.wip.beg.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</td>
                </tr>
                {metrics.wip.moves.map((move, idx) => (
                  <tr key={`wip-${move.id || idx}`} className="hover:bg-amber-50/40 transition-colors border-t border-dashed border-amber-100">
                    <td className="p-3 border-r border-amber-100 font-mono text-xs text-gray-600">{formatToMMDDYYYY(move.date)}</td>
                    <td className="p-3 border-r border-amber-100 text-xs"><span className="font-bold text-amber-800">{move.type}</span> <span className="text-gray-500 ml-2">{move.desc}</span></td>
                    <td className="p-3 border-r border-amber-100 text-right font-mono font-medium text-emerald-700">{move.in > 0 ? `+${move.in.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg` : '-'}</td>
                    <td className="p-3 border-r border-amber-100 text-right font-mono font-medium text-red-700">{move.outRice > 0 ? `-${move.outRice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg` : '-'}</td>
                    <td className="p-3 border-r border-amber-100 text-right font-mono font-medium text-red-700">{move.outRiceBags > 0 ? `-${move.outRiceBags.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} Bags` : '-'}</td>
                    <td className="p-3 border-r border-amber-100 text-right font-mono font-medium text-red-700">{move.outByproduct > 0 ? `-${move.outByproduct.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg` : '-'}</td>
                    <td className="p-3 text-right font-mono font-semibold text-emerald-900">{move.balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</td>
                  </tr>
                ))}
                <tr className="bg-amber-100/50 border-t-2 border-amber-300">
                  <td className="p-3 border-r border-amber-300 text-emerald-900 text-xs font-bold" colSpan={2}>Total Period Summary</td>
                  <td className="p-3 border-r border-amber-300 text-right font-mono font-bold text-emerald-700">+{metrics.wip.in.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</td>
                  <td className="p-3 border-r border-amber-300 text-right font-mono font-bold text-red-700">-{metrics.wip.outRice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</td>
                  <td className="p-3 border-r border-amber-300 text-right font-mono font-bold text-red-700">-{metrics.wip.outRiceBags.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} Bags</td>
                  <td className="p-3 border-r border-amber-300 text-right font-mono font-bold text-red-700">-{metrics.wip.outByproduct.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</td>
                  <td className="p-3 text-right font-mono font-black text-[15px] text-emerald-950">{metrics.wip.end.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm">
          <div className="bg-emerald-100 px-4 py-3 border-b-4 border-emerald-500 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-emerald-900 text-[15px]">Milled Rice (Finished Goods)</h4>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Primary inventory of finished goods, tracked in standard bags.</p>
            </div>
            {canExport && (
              <button onClick={() => handleExportSpecific('rice')} className="flex items-center px-3 py-1.5 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-500 transition-all shadow-sm active:scale-95 whitespace-nowrap">
                <Download size={14} className="mr-1.5" />
                Export .xlsx
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-50 text-emerald-900 text-xs border-b border-emerald-200">
                  <th className="p-3 font-semibold border-r border-emerald-200 w-[12%]">Date</th>
                  <th className="p-3 font-semibold border-r border-emerald-200 w-1/3">Movement Details</th>
                  <th className="p-3 font-semibold border-r border-emerald-200 text-right text-emerald-700">Additions (In)</th>
                  <th className="p-3 font-semibold border-r border-emerald-200 text-right text-red-700">Deductions (Out)</th>
                  <th className="p-3 font-semibold text-right text-emerald-900">Running Balance</th>
                </tr>
              </thead>
              <tbody className="text-sm text-emerald-950">
                <tr className="bg-gray-50/50">
                  <td className="p-3 border-r border-emerald-100 text-gray-500 text-xs font-semibold text-center font-mono">{beginningDateStr}</td>
                  <td className="p-3 border-r border-emerald-100 text-emerald-800 text-xs font-bold">Beginning Balance</td>
                  <td className="p-3 border-r border-emerald-100 text-right text-gray-400 font-mono text-xs">--</td>
                  <td className="p-3 border-r border-emerald-100 text-right text-gray-400 font-mono text-xs">--</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-900">{metrics.rice.begBags.toLocaleString()} bg</td>
                </tr>
                {metrics.rice.moves.map((move, idx) => (
                  <tr key={`rice-${move.id || idx}`} className="hover:bg-emerald-50/40 transition-colors border-t border-dashed border-emerald-100">
                    <td className="p-3 border-r border-emerald-100 font-mono text-xs text-gray-600">{formatToMMDDYYYY(move.date)}</td>
                    <td className="p-3 border-r border-emerald-100 text-xs"><span className="font-bold text-emerald-800">{move.type}</span> <span className="text-gray-500 ml-2">{move.desc}</span></td>
                    <td className="p-3 border-r border-emerald-100 text-right font-mono font-medium text-emerald-700">{move.inBags > 0 ? `+${move.inBags.toLocaleString()} bg` : '-'}</td>
                    <td className="p-3 border-r border-emerald-100 text-right font-mono font-medium text-red-700">{move.outBags > 0 ? `-${move.outBags.toLocaleString()} bg` : '-'}</td>
                    <td className="p-3 text-right font-mono font-semibold text-emerald-900">{move.balanceBags.toLocaleString()} bg</td>
                  </tr>
                ))}
                <tr className="bg-emerald-100/50 border-t-2 border-emerald-300">
                  <td className="p-3 border-r border-emerald-200 text-emerald-900 text-xs font-bold" colSpan={2}>Total Period Summary</td>
                  <td className="p-3 border-r border-emerald-200 text-right font-mono font-bold text-emerald-700">+{metrics.rice.inBags.toLocaleString()} bg</td>
                  <td className="p-3 border-r border-emerald-200 text-right font-mono font-bold text-red-700">-{metrics.rice.outBags.toLocaleString()} bg</td>
                  <td className="p-3 text-right font-mono font-black text-[15px] text-emerald-950">{metrics.rice.endBags.toLocaleString()} bg</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {(() => {
          const catMetrics = metrics.byproducts;
          const showAll = !selectedByproductCategory || selectedByproductCategory === 'All';
          const showRiceHull = showAll || selectedByproductCategory === 'Rice Hull';
          const showRiceBran = showAll || selectedByproductCategory === 'Rice Bran';
          const showBrewer = showAll || selectedByproductCategory === 'Brewer';
          const showSpoilage = showAll || selectedByproductCategory === 'Spoilage (Yellow Rice)';
          const showShrinkage = showAll || selectedByproductCategory === 'Shrinkage';
          const showLoss = showAll || selectedByproductCategory === 'Loss';
          return (
            <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm mt-8">
              <div className="bg-amber-800 px-4 py-3 border-b-4 border-amber-50 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-amber-300 text-[15px]">Consolidated Byproducts Ledger</h4>
                </div>
                {canExport && (
                  <button onClick={() => handleExportSpecific('byproducts')} className="flex items-center px-3 py-1.5 bg-amber-600 text-yellow-100 rounded text-[10px] font-bold hover:bg-amber-500 transition-all shadow-sm active:scale-95 whitespace-nowrap">
                    <Download size={14} className="mr-1.5" />
                    Export .xlsx
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-amber-50 text-emerald-900 text-[11px] border-b border-amber-200">
                      <th className="p-3 font-semibold border-r border-amber-200 w-[10%]">Date</th>
                      <th className="p-3 font-semibold border-r border-amber-200 w-[15%]">Movement Details</th>
                      {showRiceHull && <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Rice Hull</th>}
                      {showRiceBran && <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Rice Bran</th>}
                      {showBrewer && <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Brewer</th>}
                      {showSpoilage && <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Spoilage</th>}
                      {showShrinkage && <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Shrinkage</th>}
                      {showLoss && <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Loss</th>}
                      <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Additions (In)</th>
                      <th className="p-3 font-semibold border-r border-amber-200 text-right text-red-700">Deductions (Out)</th>
                      <th className="p-3 font-semibold text-right text-emerald-900">Running Balance (Total kg)</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px] text-emerald-950">
                    <tr className="bg-gray-50/50">
                      <td className="p-3 border-r border-amber-100 text-gray-500 font-semibold text-center font-mono">{beginningDateStr}</td>
                      <td className="p-3 border-r border-amber-100 text-emerald-800 font-bold">Beginning Balance</td>
                      {showRiceHull && <td className="p-3 border-r border-amber-100 text-right font-mono">{catMetrics.beg.riceHull.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>}
                      {showRiceBran && <td className="p-3 border-r border-amber-100 text-right font-mono">{catMetrics.beg.riceBran.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>}
                      {showBrewer && <td className="p-3 border-r border-amber-100 text-right font-mono">{catMetrics.beg.brewer.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>}
                      {showSpoilage && <td className="p-3 border-r border-amber-100 text-right font-mono">{catMetrics.beg.spoilage.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>}
                      {showShrinkage && <td className="p-3 border-r border-amber-100 text-right font-mono">{catMetrics.beg.shrinkage.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>}
                      {showLoss && <td className="p-3 border-r border-amber-100 text-right font-mono">{catMetrics.beg.loss.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>}
                      <td className="p-3 border-r border-amber-100 text-right font-mono text-gray-400">--</td>
                      <td className="p-3 border-r border-amber-100 text-right font-mono text-gray-400">--</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-900">{catMetrics.beg.total.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>
                    </tr>
                    {catMetrics.moves.filter(move => {
                      if (!selectedByproductCategory || selectedByproductCategory === 'All') return true;
                      if (selectedByproductCategory === 'Rice Hull') return move.in.riceHull !== 0 || move.out.riceHull !== 0;
                      if (selectedByproductCategory === 'Rice Bran') return move.in.riceBran !== 0 || move.out.riceBran !== 0;
                      if (selectedByproductCategory === 'Brewer') return move.in.brewer !== 0 || move.out.brewer !== 0;
                      if (selectedByproductCategory === 'Spoilage (Yellow Rice)') return move.in.spoilage !== 0 || move.out.spoilage !== 0;
                      if (selectedByproductCategory === 'Shrinkage') return move.in.shrinkage !== 0 || move.out.shrinkage !== 0;
                      if (selectedByproductCategory === 'Loss') return move.in.loss !== 0 || move.out.loss !== 0;
                      return true;
                    }).map((move, idx) => {
                      const netRiceHull = move.in.riceHull - move.out.riceHull;
                      const netRiceBran = move.in.riceBran - move.out.riceBran;
                      const netBrewer = move.in.brewer - move.out.brewer;
                      const netSpoilage = move.in.spoilage - move.out.spoilage;
                      const netShrinkage = move.in.shrinkage - move.out.shrinkage;
                      const netLoss = move.in.loss - move.out.loss;
                         
                      const renderNet = (val) => {
                        if (val === 0) return '-';
                        return <span className={val > 0 ? "text-emerald-700" : "text-red-700"}>{val > 0 ? `+${val}` : val} kg</span>;
                      };

                      return (
                        <tr key={`byp-${move.id || idx}-${move.type}`} className="hover:bg-amber-50/40 transition-colors border-t border-dashed border-amber-100">
                          <td className="p-3 border-r border-amber-100 font-mono text-gray-600">{formatToMMDDYYYY(move.date)}</td>
                          <td className="p-3 border-r border-amber-100"><span className="font-bold text-amber-800">{move.type}</span> <span className="text-gray-500 ml-1">{move.desc}</span></td>
                          {showRiceHull && <td className="p-3 border-r border-amber-100 text-right font-mono font-medium">{renderNet(netRiceHull)}</td>}
                          {showRiceBran && <td className="p-3 border-r border-amber-100 text-right font-mono font-medium">{renderNet(netRiceBran)}</td>}
                          {showBrewer && <td className="p-3 border-r border-amber-100 text-right font-mono font-medium">{renderNet(netBrewer)}</td>}
                          {showSpoilage && <td className="p-3 border-r border-amber-100 text-right font-mono font-medium">{renderNet(netSpoilage)}</td>}
                          {showShrinkage && <td className="p-3 border-r border-amber-100 text-right font-mono font-medium">{renderNet(netShrinkage)}</td>}
                          {showLoss && <td className="p-3 border-r border-amber-100 text-right font-mono font-medium">{renderNet(netLoss)}</td>}
                          <td className="p-3 border-r border-amber-100 text-right font-mono font-medium text-emerald-700">{move.in.total > 0 ? `+${move.in.total.toLocaleString()}` : '-'}</td>
                          <td className="p-3 border-r border-amber-100 text-right font-mono font-medium text-red-700">{move.out.total > 0 ? `-${move.out.total.toLocaleString()}` : '-'}</td>
                          <td className="p-3 text-right font-mono font-semibold text-emerald-900">{move.balance.total.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
export const DashboardView = ({ filteredData, bagSizes }) => {
  const stats = useMemo(() => {
    let totalPurchasedPalay = 0;
    let totalPurchasedCost = 0;
    let totalTransferredWeight = 0;
    let totalInputMilled = 0;
    let totalOutputRiceKg = 0;
    let totalIssuedWeight = 0;
    let totalIssuedBagsCount = 0;

    const productionBreakdown = (bagSizes || []).reduce((acc, size) => {
      acc[size] = { bags: 0, weight: 0 };
      return acc;
    }, {});

    const issuanceBreakdown = (bagSizes || []).reduce((acc, size) => {
      acc[size] = { bags: 0, weight: 0 };
      return acc;
    }, {});

    filteredData[TABS.PURCHASE]?.forEach(row => {
      const w = parseFloat(row.weight) || 0;
      const p = parseFloat(row.price) || 0;
      totalPurchasedPalay += w;
      totalPurchasedCost += (w * p);
    });

    filteredData[TABS.TRANSFER]?.forEach(row => {
      totalTransferredWeight += parseFloat(row.netWeight) || 0;
    });

    filteredData[TABS.PRODUCTION]?.forEach(row => {
      totalInputMilled += parseFloat(row.inputPalay) || 0;
      
      const bagSizeKg = getBagWeight(row.bagSize);
      const outBags = parseFloat(row.outputBags) || 0;
      const accurateOutputRice = bagSizeKg * outBags;
      
      totalOutputRiceKg += accurateOutputRice;

      if (row.bagSize) {
        if (!productionBreakdown[row.bagSize]) {
          productionBreakdown[row.bagSize] = { bags: 0, weight: 0 };
        }
        productionBreakdown[row.bagSize].bags += outBags;
        productionBreakdown[row.bagSize].weight += accurateOutputRice;
      }
    });

    filteredData[TABS.ISSUANCE]?.forEach(row => {
      const bagSizeKg = getBagWeight(row.bagSize);
      const issueBags = parseFloat(row.bags) || 0;
      const accurateIssuedWeight = bagSizeKg * issueBags;
      
      totalIssuedWeight += accurateIssuedWeight;
      totalIssuedBagsCount += issueBags;

      if (row.bagSize) {
        if (!issuanceBreakdown[row.bagSize]) {
          issuanceBreakdown[row.bagSize] = { bags: 0, weight: 0 };
        }
        issuanceBreakdown[row.bagSize].bags += issueBags;
        issuanceBreakdown[row.bagSize].weight += accurateIssuedWeight;
      }
    });

const averageRecoveryRate = totalInputMilled > 0 
      ? ((totalOutputRiceKg / totalInputMilled) * 100).toFixed(2)
      : '0.00';

    const averagePricePerKg = totalPurchasedPalay > 0
      ? (totalPurchasedCost / totalPurchasedPalay).toFixed(2)
      : '0.00';

    return {
      totalPurchasedPalay,
      totalPurchasedCost,
      averagePricePerKg,
      totalTransferredWeight,
      totalInputMilled,
      totalOutputRiceKg,
      totalIssuedWeight,
      totalIssuedBagsCount,
      averageRecoveryRate,
      productionBreakdown,
      issuanceBreakdown
    };
  }, [filteredData, bagSizes]);

  const allProdSizes = Object.keys(stats.productionBreakdown).sort((a,b) => getBagWeight(a) - getBagWeight(b));
  const allIssSizes = Object.keys(stats.issuanceBreakdown).sort((a,b) => getBagWeight(a) - getBagWeight(b));

  const maxProdBags = Math.max(...Object.values(stats.productionBreakdown).map(b => b.bags), 1);
  const maxIssuanceBags = Math.max(...Object.values(stats.issuanceBreakdown).map(b => b.bags), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-amber-200/60 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-lg">
            <ShoppingCart size={22} />
          </div>
<div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Palay Purchased</p>
            <p className="text-xl font-black text-emerald-900">{stats.totalPurchasedPalay.toLocaleString()} kg</p>
            <p className="text-xs text-emerald-700/80 mt-0.5 font-bold">Cost: ₱{stats.totalPurchasedCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} | Avg: ₱{stats.averagePricePerKg}/kg</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200/60 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-lg">
            <ArrowRightLeft size={22} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Transferred Weight</p>
            <p className="text-xl font-black text-emerald-900">{stats.totalTransferredWeight.toLocaleString()} kg</p>
            <p className="text-xs text-amber-700/80 mt-0.5 font-bold">Milling facility intake</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200/60 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 text-yellow-800 rounded-lg">
            <Factory size={22} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Milled Output Rice</p>
            <p className="text-xl font-black text-emerald-900">{stats.totalOutputRiceKg.toLocaleString()} kg</p>
            <p className="text-xs text-emerald-700/80 mt-0.5">Recovery: <span className="font-bold">{stats.averageRecoveryRate}%</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200/60 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-800 rounded-lg">
            <Truck size={22} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Total Issuances</p>
            <p className="text-xl font-black text-emerald-900">{stats.totalIssuedWeight.toLocaleString()} kg</p>
            <p className="text-xs text-amber-700/80 mt-0.5"><span className="font-bold text-amber-900">{stats.totalIssuedBagsCount.toLocaleString()}</span> bags dispatched</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-amber-200/60 shadow-md">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-4">
            <h3 className="font-extrabold text-emerald-900 text-md flex items-center">
              <Package className="text-yellow-500 mr-2" size={18} />
              Production Output (Categorized Bags)
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 bg-yellow-500/10 text-yellow-800 rounded-full">Rice Output</span>
          </div>
          <div className="space-y-3">
            {allProdSizes.map((size) => {
              const b = stats.productionBreakdown[size] || { bags: 0, weight: 0 };
              const pct = (b.bags / maxProdBags) * 100;
              return (
                <div key={`prod-size-${size}`} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-emerald-900">
                    <span>
                      <span className="w-12 inline-block font-bold text-amber-800">{size}</span>
                      <span className="text-[11px] text-gray-500">({b.weight.toLocaleString()} kg)</span>
                    </span>
                    <span className="font-mono text-emerald-800 font-bold">{b.bags.toLocaleString()} Bags</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-700 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${b.bags > 0 ? Math.max(pct, 2) : 0}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200/60 shadow-md">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-4">
            <h3 className="font-extrabold text-emerald-900 text-md flex items-center">
              <Truck className="text-yellow-500 mr-2" size={18} />
              Dispatch & Issuance (Categorized Bags)
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-full">Issuances</span>
          </div>
          <div className="space-y-3">
            {allIssSizes.map((size) => {
              const b = stats.issuanceBreakdown[size] || { bags: 0, weight: 0 };
              const pct = (b.bags / maxIssuanceBags) * 100;
              return (
                <div key={`iss-size-${size}`} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-emerald-900">
                    <span>
                      <span className="w-12 inline-block font-bold text-amber-800">{size}</span>
                      <span className="text-[11px] text-gray-500">({b.weight.toLocaleString()} kg)</span>
                    </span>
                    <span className="font-mono text-emerald-800 font-bold">{b.bags.toLocaleString()} Bags</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-amber-600 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${b.bags > 0 ? Math.max(pct, 2) : 0}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductionDashboardView = ({ filteredData, columns, onUpdate, onAddRow, onDeleteRow, onEditRow, readOnly, bagSizes }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-amber-200/60 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-amber-100 pb-3 mb-4">
          <div>
            <h3 className="font-extrabold text-emerald-900 text-md flex items-center">
              <Factory className="text-yellow-500 mr-2" size={18} />
              Production & Milling Ledger
            </h3>
          </div>
          {!readOnly && (
            <button
              onClick={onAddRow}
              className="flex items-center px-4 py-2 bg-emerald-800 text-yellow-400 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
            >
              <Plus size={14} className="mr-1.5" />
              Add Production Batch
            </button>
          )}
        </div>

        <DataGrid
          columns={columns}
          data={filteredData[TABS.PRODUCTION] || []}
          readOnly={readOnly}
          onUpdate={(rowId, field, value) => onUpdate(TABS.PRODUCTION, rowId, field, value)}
          onAddRow={onAddRow}
          onDeleteRow={onDeleteRow}
          onEditRow={onEditRow}
        />
      </div>
    </div>
  );
};

export const ByproductDashboardView = ({ filteredData, columns, onUpdate, onAddRow, onDeleteRow, onEditRow, userRole }) => {
  const isAuthorized = userRole === ROLES.ADMINISTRATOR || userRole === ROLES.PRODUCTION;

  const totalMillingByproduct = useMemo(() => {
    return filteredData[TABS.PRODUCTION]?.reduce((sum, row) => {
      const palay = parseFloat(row.inputPalay) || 0;
      const rice = parseFloat(row.outputRice) || 0;
      return sum + Math.max(0, palay - rice);
    }, 0) || 0;
  }, [filteredData]);

  const { ledgerBalances, totalAdded } = useMemo(() => {
    const balances = {
      'Rice Hull': 0,
      'Rice Bran': 0,
      'Brewer': 0,
      'Spoilage (Yellow Rice)': 0,
      'Shrinkage': 0,
      'Loss': 0
    };
    let added = 0;
    filteredData[TABS.BYPRODUCTS]?.forEach(row => {
      const isDeduction = row.action?.includes('Deduct');
      const mult = isDeduction ? -1 : 1;
      
      const rh = parseFloat(row.riceHull) || 0;
      const rb = parseFloat(row.riceBran) || 0;
      const br = parseFloat(row.brewer) || 0;
      const sp = parseFloat(row.spoilage) || 0;
      const sh = parseFloat(row.shrinkage) || 0;
      const ls = parseFloat(row.loss) || 0;

      balances['Rice Hull'] += rh * mult;
      balances['Rice Bran'] += rb * mult;
      balances['Brewer'] += br * mult;
      balances['Spoilage (Yellow Rice)'] += sp * mult;
      balances['Shrinkage'] += sh * mult;
      balances['Loss'] += ls * mult;

      if (!isDeduction) {
        added += (rh + rb + br + sp + sh + ls);
      }
    });
    return { ledgerBalances: balances, totalAdded: added };
  }, [filteredData]);

  const pendingCategorization = Math.max(0, totalMillingByproduct - totalAdded);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {BYPRODUCT_CATEGORIES.map((category) => {
          const balance = ledgerBalances[category] || 0;
          let themeColor = "bg-amber-100 border-amber-300 text-amber-800";
          let iconColor = "text-amber-600";
          if (category === 'Rice Hull') {
            themeColor = "bg-yellow-50/80 border-yellow-200 text-yellow-900";
            iconColor = "text-yellow-600";
          } else if (category === 'Rice Bran') {
            themeColor = "bg-orange-50/80 border-orange-200 text-orange-900";
            iconColor = "text-orange-700";
          } else if (category === 'Brewer') {
            themeColor = "bg-cyan-50/80 border-cyan-200 text-cyan-900";
            iconColor = "text-cyan-700";
          } else if (category === 'Spoilage (Yellow Rice)') {
            themeColor = "bg-emerald-50/80 border-emerald-200 text-emerald-900";
            iconColor = "text-emerald-700";
          } else if (category === 'Shrinkage') {
            themeColor = "bg-red-50/80 border-red-200 text-red-900";
            iconColor = "text-red-700";
          } else if (category === 'Loss') {
            themeColor = "bg-slate-50/80 border-slate-300 text-slate-900";
            iconColor = "text-slate-700";
          }

          return (
            <div key={category} className={`p-5 rounded-xl border shadow-sm ${themeColor}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-85">{category}</p>
                  <p className="text-2xl font-black mt-1">{balance.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</p>
                </div>
                <div className={`p-2 bg-white/70 rounded-lg ${iconColor}`}>
                  <Activity size={20} />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-black/5 text-[11px] space-y-1 opacity-80">
                <div className="flex justify-between font-bold">
                  <span>Based purely on manual logs.</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-sm font-bold text-blue-900">Pending Categorization from Milling Output</p>
          <p className="text-xs text-blue-700 mt-0.5">Theoretical generated byproduct (Input - Output) minus total manually added below.</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-blue-900">{pendingCategorization.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</p>
        </div>
      </div>

      
      <div className="bg-white p-5 rounded-xl border border-amber-200/60 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-amber-100 pb-3 mb-4">
          <div>
            <h3 className="font-extrabold text-emerald-900 text-md flex items-center">
              <Scale className="text-yellow-500 mr-2" size={18} />
              Consolidated Byproduct Ledger
            </h3>
            <p className="text-xs text-amber-700/80 mt-0.5">
              {isAuthorized 
                 ? `Authorized: Double-click or use Arrow Keys to manually modify additions, append rows, or delete existing transaction metrics.` 
                 : 'View Only: Only Accounting/Admin and Production Departments can modify or delete byproduct sheets.'
              }
            </p>
          </div>
          {isAuthorized && (
            <button
              onClick={() => onAddRow(TABS.BYPRODUCTS)}
              className="flex items-center px-4 py-2 bg-emerald-800 text-yellow-400 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
            >
              <Plus size={14} className="mr-1.5" />
              Add Entry
            </button>
          )}
        </div>
        <DataGrid
          columns={columns}
          data={filteredData[TABS.BYPRODUCTS] || []}
          readOnly={!isAuthorized}
          onUpdate={(rowIndex, field, value) => onUpdate(TABS.BYPRODUCTS, rowIndex, field, value)}
          onAddRow={() => onAddRow(TABS.BYPRODUCTS)}
          onDeleteRow={onDeleteRow}
          onEditRow={onEditRow}
        />
      </div>

    </div>
  );
};


const EditUserModal = ({ isOpen, onClose, user, onSave }) => {
  const [role, setRole] = useState('');
  const [designation, setDesignation] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setRole(user.role || '');
      setDesignation(user.designation || '');
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setMiddleInitial(user.middleInitial || '');
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        role, designation, firstName, lastName, middleInitial,
        label: `${firstName} ${lastName}`.trim()
      });
      onSave({ ...user, role, designation, firstName, lastName, middleInitial, label: `${firstName} ${lastName}`.trim() });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-amber-200 overflow-hidden">
        <div className="bg-emerald-800 px-6 py-4 flex justify-between items-center border-b-4 border-yellow-500">
          <h3 className="font-extrabold text-white text-lg">Edit User</h3>
          <button onClick={onClose} className="text-emerald-200 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-emerald-900 mb-1">First Name</label>
              <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-emerald-900 mb-1">Last Name</label>
              <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
            </div>
            <div className="w-20">
              <label className="block text-xs font-bold text-emerald-900 mb-1">M.I.</label>
              <input type="text" maxLength={2} value={middleInitial} onChange={e => setMiddleInitial(e.target.value)} className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-900 mb-1">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none">
              <option value="Administrator">Administrator</option>
              <option value="Accounting">Accounting</option>
              <option value="Purchase">Purchase</option>
              <option value="Production">Production</option>
              <option value="Observer">Observer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-emerald-900 mb-1">Designation</label>
            <input type="text" required value={designation} onChange={e => setDesignation(e.target.value)} className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
          </div>
          <div className="pt-2 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-emerald-800 text-yellow-400 rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const UserDirectoryView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'));
        const snapshot = await getDocs(q);
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);
      } catch (e) {
        console.error("Failed to fetch users", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (u) => {
    if (confirm(`Are you sure you want to delete ${u.label || u.email}? This will permanently remove their system access.`)) {
      try {
        await deleteDoc(doc(db, 'users', u.id));
        setUsers(users.filter(user => user.id !== u.id));
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  const handleResetPassword = async (u) => {
    if (confirm(`Send password reset email to ${u.email}?`)) {
      try {
        await sendPasswordResetEmail(auth, u.email);
        alert(`Password reset email sent to ${u.email}`);
      } catch (err) {
        alert('Failed to send password reset email.');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-amber-200/60 shadow-lg min-h-[400px]">
      <div className="border-b border-amber-100 pb-4 mb-6">
        <h3 className="font-extrabold text-emerald-900 text-lg flex items-center">
          <UserCircle className="text-yellow-500 mr-2" size={22} />
          Admin User Directory
        </h3>
        <p className="text-xs font-semibold text-amber-700/80 mt-1">
          Manage and view all registered system users. Password viewing is restricted for security.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <RefreshCw className="animate-spin text-emerald-500" size={32} />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-amber-200 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-800 text-yellow-400 text-xs border-b-4 border-yellow-500">
                <th className="p-3 font-bold border-r border-emerald-700 w-1/4">Name</th>
                <th className="p-3 font-bold border-r border-emerald-700">Account Role</th>
                <th className="p-3 font-bold border-r border-emerald-700">Designation</th>
                <th className="p-3 font-bold border-r border-emerald-700">Username</th>
                <th className="p-3 font-bold border-r border-emerald-700">Email Address</th>
                <th className="p-3 font-bold text-center border-r border-emerald-700">Password</th>
                <th className="p-3 font-bold text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-emerald-950 bg-white">
              {users.map((u, idx) => (
                <tr key={u.id} className="hover:bg-amber-50/50 transition-colors border-b border-amber-100 last:border-0">
                  <td className="p-3 border-r border-amber-100 font-semibold">
                    {u.lastName ? `${u.lastName}, ${u.firstName} ${u.middleInitial || ''}` : u.label}
                  </td>
                  <td className="p-3 border-r border-amber-100">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold border border-yellow-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 border-r border-amber-100">{u.designation || 'N/A'}</td>
                  <td className="p-3 border-r border-amber-100 font-mono text-xs">{u.username || 'N/A'}</td>
                  <td className="p-3 border-r border-amber-100 font-mono text-xs">{u.email}</td>
                  <td className="p-3 text-center text-xs font-bold text-gray-400 italic border-r border-amber-100">
                    Protected
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button onClick={() => setEditingUser(u)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit User">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleResetPassword(u)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Reset Password">
                        <Key size={16} />
                      </button>
                      <button onClick={() => handleDelete(u)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500 font-medium">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <EditUserModal 
        isOpen={!!editingUser} 
        onClose={() => setEditingUser(null)} 
        user={editingUser} 
        onSave={(updatedUser) => setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u))}
      />
    </div>
  );
};
