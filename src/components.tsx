// @ts-nocheck
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Lock, UserCircle, X, AlertCircle, Wheat, Trash2, Plus, Edit2, Settings, Save, Download, RefreshCw, Package, Truck, Calendar, Filter, Activity } from 'lucide-react';
import { ROLES, TABS, getBagWeight, BYPRODUCT_CATEGORIES, formatToMMDDYYYY } from './utils';

import { auth, db } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [label, setLabel] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isSignUp) {
        if (adminPasscode !== 'AccountingSignUpPPP') {
           setError('Invalid Registration Passcode.');
           setLoading(false);
           return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, passcode);
        await setDoc(doc(db, 'users', userCred.user.uid), {
          role: selectedRole,
          label: label || email,
          email: email
        });
      } else {
        await signInWithEmailAndPassword(auth, email, passcode);
      }
    } catch (err) {
      if (err.code === 'auth/admin-restricted-operation') {
        setError('Sign-up is restricted by Firebase administrators. Please ask your administrator to create your account or enable public sign-ups in Firebase Console.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is not enabled in Firebase Console. Please enable it in Authentication settings.');
      } else {
        setError(err.message || 'Authentication failed. Please verify your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-[#fdfbf7] p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-8 border-yellow-500 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg border-2 border-yellow-500 overflow-hidden">
            <Wheat className="w-full h-full text-yellow-600 p-4" />
          </div>
          <h1 className="text-2xl font-black text-emerald-900 text-center tracking-wide">Isabela Rice Processing Complex</h1>
          <p className="text-amber-800 font-bold text-xs uppercase tracking-wider mt-1">Inventory Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex justify-center mb-2">
            <div className="bg-emerald-100 p-1 rounded-lg inline-flex">
              <button 
                type="button" 
                onClick={() => { setIsSignUp(false); setError(''); }}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${!isSignUp ? 'bg-emerald-800 text-white shadow-sm' : 'text-emerald-800 hover:bg-emerald-200'}`}
              >
                Sign In
              </button>
              <button 
                type="button" 
                onClick={() => { setIsSignUp(true); setError(''); }}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${isSignUp ? 'bg-emerald-800 text-white shadow-sm' : 'text-emerald-800 hover:bg-emerald-200'}`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-emerald-900 mb-1.5">Select Account Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircle className="h-5 w-5 text-emerald-700" />
                </div>
                <select
                  value={selectedRole}
                  onChange={(e) => { setSelectedRole(e.target.value); setError(''); }}
                  className="block w-full pl-10 pr-3 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-emerald-950 font-bold appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>-- Select Assigned Role --</option>
                  <option value={ROLES.ADMINISTRATOR}>Administrator</option>
                  <option value={ROLES.ACCOUNTING}>Accounting</option>
                  <option value={ROLES.PURCHASE}>Purchasing Department</option>
                  <option value={ROLES.PRODUCTION}>Production Department</option>
                  <option value={ROLES.OBSERVER}>Observer (View Only)</option>
                </select>
              </div>
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-emerald-900 mb-1.5">Full Name / Label</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircle className="h-5 w-5 text-emerald-700 opacity-50" />
                </div>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => { setLabel(e.target.value); setError(''); }}
                  className="block w-full pl-10 pr-3 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-emerald-950 placeholder-emerald-300 transition-all font-mono"
                  placeholder="Enter Name"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-emerald-900 mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCircle className="h-5 w-5 text-emerald-700 opacity-50" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="block w-full pl-10 pr-3 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-emerald-950 placeholder-emerald-300 transition-all font-mono"
                placeholder="Enter Email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-emerald-900 mb-1.5">{isSignUp ? 'Create Passcode' : 'Access Passcode'}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-emerald-700" />
              </div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => { setPasscode(e.target.value); setError(''); }}
                className="block w-full pl-10 pr-3 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-emerald-950 placeholder-emerald-300 transition-all font-mono"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-emerald-900 mb-1.5">Registration Passcode</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-emerald-700" />
                </div>
                <input
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => { setAdminPasscode(e.target.value); setError(''); }}
                  className="block w-full pl-10 pr-3 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-emerald-950 placeholder-emerald-300 transition-all font-mono"
                  placeholder="Required for Sign Up"
                  required
                />
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-xs text-red-700 font-medium animate-pulse">
              <AlertCircle className="shrink-0 mr-2" size={14} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center mt-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-black uppercase tracking-wider text-emerald-950 bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>
      </div>
    </div>
  );
};

export const FilterToolbar = ({ 
  timeframe, setTimeframe, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, 
  availableOptions, formatMonthLabel, activeTab, bagSizes, warehouses,
  selectedBagSize, setSelectedBagSize, selectedWarehouse, setSelectedWarehouse,
  selectedByproductCategory, setSelectedByproductCategory
}) => {
  const showBagFilter = activeTab === TABS.PRODUCTION || activeTab === TABS.ISSUANCE || activeTab === TABS.INVENTORY || activeTab === TABS.OTHERS;
  const showWarehouseFilter = activeTab === TABS.TRANSFER;
  const showByproductFilter = false;

  return (
    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div className="flex flex-wrap items-center gap-4 text-emerald-900">
        <div className="flex items-center space-x-2">
          <Filter className="text-yellow-600" size={18} />
          <span className="font-bold text-xs tracking-wide uppercase">Report Filters:</span>
        </div>
        
        {showBagFilter && (
          <div className="flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-lg">
            <Package className="text-yellow-600" size={14} />
            <span className="text-xs font-bold text-emerald-800">Bag Size:</span>
            <select
              value={selectedBagSize}
              onChange={(e) => setSelectedBagSize(e.target.value)}
              className="py-1 px-2 border border-amber-300 rounded text-xs font-bold bg-white text-emerald-800 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            >
              <option value="All">All Sizes</option>
              {(bagSizes || []).map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {showWarehouseFilter && (
          <div className="flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-lg">
            <Truck className="text-yellow-600" size={14} />
            <span className="text-xs font-bold text-emerald-800">Origin Warehouse:</span>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="py-1 px-2 border border-amber-300 rounded text-xs font-bold bg-white text-emerald-800 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            >
              <option value="All">All Warehouses</option>
              {(warehouses || []).map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        )}

        {showByproductFilter && (
          <div className="flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-lg">
            <Activity className="text-yellow-600" size={14} />
            <span className="text-xs font-bold text-emerald-800">Byproduct:</span>
            <select
              value={selectedByproductCategory}
              onChange={(e) => setSelectedByproductCategory(e.target.value)}
              className="py-1 px-2 border border-amber-300 rounded text-xs font-bold bg-white text-emerald-800 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            >
              <option value="All">All Categories</option>
              {BYPRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-amber-300 p-1 bg-white shadow-inner">
          <button
            onClick={() => setTimeframe('overall')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              timeframe === 'overall'
                ? 'bg-emerald-800 text-yellow-400 shadow-sm'
                : 'text-emerald-800 hover:bg-amber-100/50'
            }`}
          >
            Overall (Sept 2023+)
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              timeframe === 'monthly'
                ? 'bg-emerald-800 text-yellow-400 shadow-sm'
                : 'text-emerald-800 hover:bg-amber-100/50'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTimeframe('yearly')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              timeframe === 'yearly'
                ? 'bg-emerald-800 text-yellow-400 shadow-sm'
                : 'text-emerald-800 hover:bg-amber-100/50'
            }`}
          >
            Yearly
          </button>
        </div>

        {timeframe === 'monthly' && (
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-8 pr-6 py-1.5 border border-amber-300 rounded-lg text-xs font-bold bg-white text-emerald-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none cursor-pointer"
            >
              {availableOptions.months.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>
            <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-yellow-600 pointer-events-none" size={14} />
          </div>
        )}

        {timeframe === 'yearly' && (
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="pl-8 pr-6 py-1.5 border border-amber-300 rounded-lg text-xs font-bold bg-white text-emerald-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none cursor-pointer"
            >
              {availableOptions.years.map((y) => (
                <option key={y} value={y}>
                  Year: {y}
                </option>
              ))}
            </select>
            <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-yellow-600 pointer-events-none" size={14} />
          </div>
        )}
      </div>
    </div>
  );
};

export const DataGrid = ({ columns, data, onUpdate, onAddRow, onDeleteRow, onEditRow, readOnly }) => {
  const inputRefs = useRef({});

  const handleKeyDown = (e, rowId, colIndex, dataIdx) => {
    let nextRowIndex = dataIdx;
    let nextColIndex = colIndex;

    switch (e.key) {
      case 'ArrowUp':
        nextRowIndex = Math.max(0, dataIdx - 1);
        break;
      case 'ArrowDown':
      case 'Enter':
        nextRowIndex = Math.min(data.length - 1, dataIdx + 1);
        if (e.key === 'Enter') e.preventDefault();
        break;
      case 'ArrowLeft':
        nextColIndex = Math.max(0, colIndex - 1);
        break;
      case 'ArrowRight':
        nextColIndex = Math.min(columns.length - 1, colIndex + 1);
        break;
      default:
        return;
    }

    if (nextRowIndex !== dataIdx || nextColIndex !== colIndex) {
      e.preventDefault();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
         while(columns[nextColIndex]?.readOnly && (e.key === 'ArrowRight' ? nextColIndex < columns.length - 1 : nextColIndex > 0)) {
             nextColIndex += e.key === 'ArrowRight' ? 1 : -1;
         }
      }
      
      const targetId = `${data[nextRowIndex].id}-${nextColIndex}`;
      const targetRef = inputRefs.current[targetId];
      if (targetRef) {
        try {
          targetRef.focus();
          setTimeout(() => {
            try {
              if (targetRef && typeof targetRef.select === 'function' && document.activeElement === targetRef) {
                targetRef.select();
              }
            } catch (selectErr) {}
          }, 30);
        } catch (focusErr) {}
      }
    }
  };

  const calculateSum = (key) => {
    if (key === 'recovery') {
      let totalInput = 0;
      let totalOutputRice = 0;
      data.forEach(row => {
         const inPalay = parseFloat(row.inputPalay) || 0;
         const outBags = parseFloat(row.outputBags) || 0;
         const bagSizeKg = getBagWeight(row.bagSize);
         totalInput += inPalay;
         totalOutputRice += (outBags * bagSizeKg);
      });
      return totalInput > 0 ? (totalOutputRice / totalInput) * 100 : 0;
    }

    return data.reduce((sum, row) => {
      let val = 0;
      if (key === 'total' && row.weight !== undefined && row.price !== undefined) {
         val = (parseFloat(row.weight) || 0) * (parseFloat(row.price) || 0);
      } else if (key === 'outputRice' && row.outputBags !== undefined && row.bagSize !== undefined) {
         val = (parseFloat(row.outputBags) || 0) * getBagWeight(row.bagSize);
      } else if (key === 'byproduct' && row.inputPalay !== undefined) {
         const outRice = (parseFloat(row.outputBags) || 0) * getBagWeight(row.bagSize);
         val = Math.max(0, (parseFloat(row.inputPalay) || 0) - outRice);
      } else if (key === 'totalWeight' && row.bags !== undefined && row.bagSize !== undefined) {
         val = (parseFloat(row.bags) || 0) * getBagWeight(row.bagSize);
      } else if (key === 'totalAmount' && row.bags !== undefined && row.unitCost !== undefined) {
         val = (parseFloat(row.bags) || 0) * (parseFloat(row.unitCost) || 0);
      } else if (key === 'quantity' && row.action?.includes('Deduct')) {
        val = -parseFloat(row[key]) || 0;
      } else {
        val = parseFloat(row[key]) || 0;
      }
      return sum + val;
    }, 0);
  };

  return (
    <div className="bg-white rounded-xl border border-amber-200 overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-emerald-800 text-yellow-500 text-xs border-b-4 border-yellow-600">
              <th className="p-3 w-12 text-center font-bold">No.</th>
              {columns.map((col) => (
                <th key={col.key} className="p-3 font-semibold whitespace-nowrap border-r border-emerald-700 last:border-r-0">
                  {col.label}
                </th>
              ))}
              {!readOnly && (onDeleteRow || onEditRow) && (
                <th className="p-3 w-24 text-center">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="text-xs text-emerald-900">
            {data.map((row, dataIdx) => (
              <tr key={row.id} className="border-b border-amber-100 hover:bg-amber-50/50 transition-colors">
                <td className="p-2 text-center text-amber-600 font-medium bg-amber-50 border-r border-amber-200">
                  {data.length - dataIdx}
                </td>
                {columns.map((col, colIndex) => {
                  const isReadOnly = readOnly || col.readOnly || !!onEditRow;
                  const cellRefId = `${row.id}-${colIndex}`;
                  let value = row[col.key];
                  
                  if (col.key === 'total' && row.weight !== undefined && row.price !== undefined) {
                      value = (parseFloat(row.weight) || 0) * (parseFloat(row.price) || 0);
                  } else if (col.key === 'outputRice' && row.outputBags !== undefined && row.bagSize !== undefined) {
                      value = (parseFloat(row.outputBags) || 0) * getBagWeight(row.bagSize);
                  } else if (col.key === 'byproduct') {
                      const outRice = (parseFloat(row.outputBags) || 0) * getBagWeight(row.bagSize);
                      value = Math.max(0, (parseFloat(row.inputPalay) || 0) - outRice);
                  } else if (col.key === 'recovery') {
                      const outRice = (parseFloat(row.outputBags) || 0) * getBagWeight(row.bagSize);
                      const inPalay = parseFloat(row.inputPalay) || 0;
                      value = inPalay > 0 ? ((outRice / inPalay) * 100).toFixed(2) : 0;
                  } else if (col.key === 'totalWeight' && row.bags !== undefined && row.bagSize !== undefined) {
                      value = (parseFloat(row.bags) || 0) * getBagWeight(row.bagSize);
                  } else if (col.key === 'totalAmount' && row.bags !== undefined && row.unitCost !== undefined) {
                      value = (parseFloat(row.bags) || 0) * (parseFloat(row.unitCost) || 0);
                  }
                  
                  if (col.type === 'select') {
                    return (
                      <td key={col.key} className="p-0 border-r border-amber-100 last:border-r-0 relative">
                        <select
                          ref={(el) => (inputRefs.current[cellRefId] = el)}
                          value={value}
                          onChange={(e) => onUpdate(row.id, col.key, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, row.id, colIndex, dataIdx)}
                          disabled={isReadOnly}
                          className={`w-full h-full p-2.5 outline-none transition-all appearance-none cursor-pointer bg-transparent
                            ${isReadOnly ? 'bg-gray-50/80 text-gray-500 cursor-default font-semibold' : 'hover:bg-white focus:bg-white focus:ring-2 focus:ring-inset focus:ring-yellow-500'}
                          `}
                        >
                          {col.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        {!isReadOnly && (
                          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-emerald-700">
                            <span className="text-[9px]">▼</span>
                          </div>
                        )}
                      </td>
                    );
                  }

                  let displayValue = value;
                  if (col.type === 'number') {
                     displayValue = value === 0 && !isReadOnly ? '' : value;
                     if (isReadOnly && (col.key === 'total' || col.key === 'price' || col.key === 'totalAmount')) {
                         displayValue = '₱ ' + parseFloat(value || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
                     } else if (isReadOnly && col.key === 'recovery') {
                         displayValue = parseFloat(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
                     } else if (isReadOnly) {
                         displayValue = parseFloat(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
                     }
                  } else if (col.type === 'date' && displayValue) {
                     displayValue = formatToMMDDYYYY(displayValue);
                  }

                  const isResultCol = col.key === 'total' || col.key === 'outputRice' || col.key === 'totalWeight' || col.key === 'totalAmount' || col.key === 'byproduct' || col.key === 'recovery';
                  let bgClass = 'bg-transparent hover:bg-white focus:bg-white focus:ring-2 focus:ring-inset focus:ring-yellow-500';
                  if (isReadOnly) {
                      bgClass = isResultCol ? 'bg-emerald-50/80 text-emerald-950 font-extrabold cursor-default' : 'bg-gray-50/80 text-gray-500 cursor-default font-semibold';
                  }

                  return (
                    <td key={col.key} className="p-0 border-r border-amber-100 last:border-r-0 relative">
                      <input
                        ref={(el) => (inputRefs.current[cellRefId] = el)}
                        type={col.type === 'number' ? 'text' : (col.type === 'date' && !isReadOnly ? 'date' : 'text')}
                        value={col.type === 'date' && !isReadOnly ? value : displayValue}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (col.type === 'number' && !isReadOnly) {
                            if (val !== '' && !/^\d*\.?\d*$/.test(val)) return; 
                          }
                          onUpdate(row.id, col.key, val);
                        }}
                        onKeyDown={(e) => handleKeyDown(e, row.id, colIndex, dataIdx)}
                        readOnly={isReadOnly}
                        className={`w-full h-full p-2.5 outline-none transition-all ${bgClass} ${col.type === 'number' ? 'text-right font-mono' : ''}`}
                      />
                    </td>
                  );
                })}
                {!readOnly && onDeleteRow && (
                  <td className="p-1 text-center border-b border-amber-100">
                    <button
                      onClick={() => onDeleteRow(row.id)}
                      className="p-1 text-red-600 hover:text-red-900 rounded hover:bg-red-50 transition-colors"
                      title="Delete Entry Row"
                    >
                      <Trash2 size={14} className="mx-auto" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-amber-100 border-t-2 border-amber-300 font-semibold text-emerald-900 text-xs">
            <tr>
              <td className="p-3 text-center border-r border-amber-300 font-bold">Sum</td>
              {columns.map((col) => {
                const isResultCol = col.key === 'total' || col.key === 'outputRice' || col.key === 'totalWeight' || col.key === 'totalAmount' || col.key === 'byproduct' || col.key === 'recovery';
                return (
                  <td key={`sum-${col.key}`} className={`p-3 border-r border-amber-300 last:border-r-0 ${col.type === 'number' ? 'text-right font-mono font-bold' : ''} ${isResultCol ? 'bg-emerald-100 text-emerald-950 text-[13px]' : ''}`}>
                    {col.sum ? (
                      col.key === 'total' || col.key === 'price' || col.key === 'totalAmount' ? 
                        `₱ ${calculateSum(col.key).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 
                      col.key === 'recovery' ?
                        `${calculateSum(col.key).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%` :
                        calculateSum(col.key).toLocaleString(undefined, { maximumFractionDigits: 2 })
                    ) : null}
                  </td>
                );
              })}
              {!readOnly && (onDeleteRow || onEditRow) && (
                <td className="border-r border-amber-300"></td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
      
      {!readOnly && (
        <div className="p-3 bg-gray-50 border-t border-amber-200">
          <button 
            onClick={onAddRow}
            className="flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:bg-amber-100 px-4 py-2 rounded-lg transition-all border border-transparent hover:border-amber-300"
          >
            <Plus size={14} className="mr-1.5" />
            Add New Transaction Row
          </button>
        </div>
      )}
    </div>
  );
};

export const SettingsPanel = ({ settings, onUpdateSettings, data, onRestoreData }) => {
  const [formData, setFormData] = useState(settings);
  const [showToast, setShowToast] = useState(false);
  const [newBagSize, setNewBagSize] = useState('');
  const [newWarehouse, setNewWarehouse] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleFacilityChange = (e) => {
    setFormData({ ...formData, facilityName: e.target.value });
  };

  const handleAddBagSize = () => {
    const trimmed = newBagSize.trim();
    if (trimmed && !(formData.bagSizes || []).includes(trimmed)) {
      setFormData({ ...formData, bagSizes: [...(formData.bagSizes || []), trimmed] });
      setNewBagSize('');
    }
  };

  const removeBagSize = (sizeToRemove) => {
    setFormData({ ...formData, bagSizes: (formData.bagSizes || []).filter(s => s !== sizeToRemove) });
  };

  const handleAddWarehouse = () => {
    const trimmed = newWarehouse.trim().toUpperCase();
    if (trimmed && !(formData.warehouses || []).includes(trimmed)) {
      setFormData({ ...formData, warehouses: [...(formData.warehouses || []), trimmed] });
      setNewWarehouse('');
    }
  };

  const removeWarehouse = (whToRemove) => {
    setFormData({ ...formData, warehouses: (formData.warehouses || []).filter(w => w !== whToRemove) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3500);
  };

  const handleDownloadBackup = () => {
    const backupObj = {
      timestamp: new Date().toISOString(),
      settings: formData,
      data: data
    };
    const jsonString = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Isabela_Rice_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.data && parsed.settings) {
          onRestoreData(parsed.data, parsed.settings);
          alert("Backup restored successfully!");
        }
      } catch (err) {
        console.error("Backup restoration failed:", err);
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-amber-200/60 shadow-lg space-y-8">
      <div className="flex justify-between items-center border-b border-amber-100 pb-4">
        <div>
          <h3 className="font-extrabold text-emerald-900 text-lg flex items-center">
            <Settings className="text-yellow-500 mr-2" size={22} />
            System Configuration
          </h3>
          <p className="text-xs font-semibold text-amber-700/80 mt-1">Manage facility details, dynamic dropdowns, personnel, and data backups.</p>
        </div>
        <button 
          type="submit"
          className="flex items-center px-6 py-2.5 bg-yellow-500 text-emerald-950 rounded-lg text-sm font-black hover:bg-yellow-400 transition-all shadow-md active:scale-95"
        >
          <Save size={18} className="mr-2" />
          {showToast ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        <div>
            <label className="block text-xs font-bold text-emerald-900 mb-2 uppercase tracking-wide">Facility / Branch Name</label>
            <input 
              type="text" 
              value={formData.facilityName || ''} 
              onChange={handleFacilityChange}
              className="w-full md:w-1/2 p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-yellow-500 text-sm font-bold text-emerald-900"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-amber-100">
            <div>
                <label className="block text-xs font-bold text-emerald-900 mb-2 uppercase tracking-wide flex items-center">
                    <Package className="mr-1.5 text-yellow-600" size={16} />
                    Standard Bag Sizes (Outputs & Issuances)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                    {(formData.bagSizes || []).map(size => (
                        <span key={size} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            {size}
                            <button type="button" onClick={() => removeBagSize(size)} className="ml-2 text-amber-600 hover:text-red-600">
                                <Trash2 size={12} />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newBagSize}
                        onChange={(e) => setNewBagSize(e.target.value)}
                        placeholder="e.g., 50kgs"
                        className="flex-1 p-2 border border-amber-300 rounded-lg text-xs"
                    />
                    <button type="button" onClick={handleAddBagSize} className="px-3 py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold hover:bg-emerald-700">
                        Add Size
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-emerald-900 mb-2 uppercase tracking-wide flex items-center">
                    <Truck className="mr-1.5 text-yellow-600" size={16} />
                    Origin Warehouses (Transfers To Facility)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                    {(formData.warehouses || []).map(wh => (
                        <span key={wh} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                            {wh}
                            <button type="button" onClick={() => removeWarehouse(wh)} className="ml-2 text-emerald-600 hover:text-red-600">
                                <Trash2 size={12} />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newWarehouse}
                        onChange={(e) => setNewWarehouse(e.target.value)}
                        placeholder="e.g., MAIN WAREHOUSE"
                        className="flex-1 p-2 border border-amber-300 rounded-lg text-xs uppercase"
                    />
                    <button type="button" onClick={handleAddWarehouse} className="px-3 py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold hover:bg-emerald-700">
                        Add Location
                    </button>
                </div>
            </div>
        </div>

        <div className="mt-8 pt-6 border-t-2 border-amber-200">
          <h3 className="font-bold text-emerald-900 text-sm mb-3 flex items-center">
            <Download className="mr-2 text-yellow-600" size={18} />
            Local Network Backup & Restore
          </h3>
          <p className="text-xs text-emerald-700/80 mb-4">
            For offline usage or manual network syncing across computers, download the database to a shared folder, or restore from an existing file.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              type="button"
              onClick={handleDownloadBackup}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all"
            >
              <Save size={16} className="mr-2 text-emerald-600" />
              Download Full Data Backup
            </button>
            
            <div className="flex-1 relative">
              <input 
                type="file" 
                accept=".json" 
                onChange={handleUploadBackup}
                ref={fileInputRef}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-full h-full flex items-center justify-center px-4 py-3 bg-amber-50 border border-amber-300 text-amber-800 rounded-lg text-xs font-bold hover:bg-amber-100 transition-all pointer-events-none">
                <RefreshCw size={16} className="mr-2 text-amber-600" />
                Load Backup from Network
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export const DuplicateModal = ({ duplicates, onClose }) => {
  if (!duplicates || duplicates.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-t-8 border-red-600 rounded-2xl p-6 shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
          <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          Duplicate Errors Detected
        </h2>
        <div className="overflow-y-auto mb-6 flex-grow border border-red-100 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-red-50 text-red-900 text-sm">
                <th className="p-3 border-b border-red-200">Module</th>
                <th className="p-3 border-b border-red-200">Type</th>
                <th className="p-3 border-b border-red-200">Duplicate Number</th>
                <th className="p-3 border-b border-red-200">Count</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {duplicates.map((dup, i) => (
                <tr key={i} className="border-b border-red-50 last:border-b-0 hover:bg-red-50/50">
                  <td className="p-3 capitalize text-red-900">{dup.tab}</td>
                  <td className="p-3 text-red-900">{dup.label}</td>
                  <td className="p-3 font-mono font-bold text-red-700">{dup.original}</td>
                  <td className="p-3 text-red-900">{dup.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export const TransactionModal = ({ isOpen, onClose, onSave, title, columns, initialData }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (key, value, type) => {
    let val = value;
    if (type === 'number') {
      val = val === '' ? '' : parseFloat(val) || 0;
    }
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-t-8 border-yellow-500 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-emerald-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-4 flex-grow">
          {columns.map(col => {
            // Computed or read-only columns shouldn't usually be editable, but let's hide them or show as read-only
            // In our system, some columns are purely computed by handleDataUpdate, some are inputs.
            // Let's just render inputs for all except readOnly.
            if (col.readOnly) return null;
            
            return (
              <div key={col.key} className="flex flex-col">
                <label className="text-xs font-bold text-emerald-700 mb-1">{col.label}</label>
                {col.type === 'select' ? (
                  <select
                    className="p-2 border border-emerald-200 rounded-lg bg-emerald-50/30 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                    value={formData[col.key] || ''}
                    onChange={(e) => handleChange(col.key, e.target.value, col.type)}
                  >
                    <option value="">Select...</option>
                    {col.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={col.type === 'number' ? 'number' : (col.type === 'date' ? 'date' : 'text')}
                    className="p-2 border border-emerald-200 rounded-lg bg-emerald-50/30 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                    value={formData[col.key] || ''}
                    onChange={(e) => handleChange(col.key, e.target.value, col.type)}
                  />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-sm font-bold text-emerald-900 bg-yellow-400 hover:bg-yellow-500 rounded-lg transition-colors flex items-center shadow-sm"
          >
            <Save size={16} className="mr-2" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
