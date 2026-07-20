import re

with open('src/views.tsx', 'r') as f:
    code = f.read()

# 1. Replace initialization in metrics
pattern_init = r"byproducts: BYPRODUCT_CATEGORIES\.reduce\(\(acc, cat\) => \{ acc\[cat\] = \{ beg: 0, in: 0, out: 0, end: 0, moves: \[\] \}; return acc; \}, \{\}\)"
replace_init = r"""byproducts: {
        beg: { riceHull: 0, riceBran: 0, brewer: 0, spoilage: 0, shrinkage: 0, loss: 0, total: 0 },
        in: { riceHull: 0, riceBran: 0, brewer: 0, spoilage: 0, shrinkage: 0, loss: 0, total: 0 },
        out: { riceHull: 0, riceBran: 0, brewer: 0, spoilage: 0, shrinkage: 0, loss: 0, total: 0 },
        end: { riceHull: 0, riceBran: 0, brewer: 0, spoilage: 0, shrinkage: 0, loss: 0, total: 0 },
        moves: []
      }"""
code = re.sub(pattern_init, replace_init, code)

# 2. Replace processing in (data[TABS.BYPRODUCTS] || []).forEach
pattern_process = r"\(data\[TABS\.BYPRODUCTS\] \|\| \[\]\)\.forEach\(r => \{[\s\S]*?const processMoves = \(movesArray"
replace_process = r"""(data[TABS.BYPRODUCTS] || []).forEach(r => {
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

    const processMoves = (movesArray"""
code = re.sub(pattern_process, replace_process, code)

# 3. Replace processMoves calls
pattern_pm = r"BYPRODUCT_CATEGORIES\.forEach\(cat => \{\s*processMoves\(m\.byproducts\[cat\]\.moves, m\.byproducts\[cat\]\.beg\);\s*\}\);"
replace_pm = r"processByproductMoves(m.byproducts.moves, m.byproducts.beg);"
code = re.sub(pattern_pm, replace_pm, code)

# 4. Replace m.byproducts[cat].end computation
pattern_end = r"BYPRODUCT_CATEGORIES\.forEach\(cat => \{\s*m\.byproducts\[cat\]\.end = m\.byproducts\[cat\]\.beg \+ m\.byproducts\[cat\]\.in - m\.byproducts\[cat\]\.out;\s*\}\);"
replace_end = r"""const keys = ['riceHull', 'riceBran', 'brewer', 'spoilage', 'shrinkage', 'loss', 'total'];
    keys.forEach(k => {
      m.byproducts.end[k] = m.byproducts.beg[k] + m.byproducts.in[k] - m.byproducts.out[k];
    });"""
code = re.sub(pattern_end, replace_end, code)

# 5. Handle handleExport Summary Rows
pattern_export = r"BYPRODUCT_CATEGORIES\.forEach\(cat => \{[\s\S]*?summaryRows\.push\(\[`Byproduct: \$\{cat\} \(kg\)`[\s\S]*?\}\);"
replace_export = r"""summaryRows.push([`Consolidated Byproduct (kg)`, fmtQty(metrics.byproducts.beg.total), fmtQty(metrics.byproducts.in.total), fmtQty(metrics.byproducts.out.total), fmtQty(metrics.byproducts.end.total)]);"""
code = re.sub(pattern_export, replace_export, code)

# 6. Handle handleExport Byproducts Rows
pattern_exp2 = r"BYPRODUCT_CATEGORIES\.forEach\(cat => \{[\s\S]*?sheetsData\.push\(\{ tabName: cat\.substring\(0, 31\), facilityName: settings\.facilityName, reportKind: `\$\{cat\.toUpperCase\(\)\} LEDGER`[\s\S]*?\}\);"
replace_exp2 = r"""const bypRows = [["Date", "Action / Reference", "Rice Hull (In)", "Rice Hull (Out)", "Rice Bran (In)", "Rice Bran (Out)", "Brewer (In)", "Brewer (Out)", "Spoilage (In)", "Spoilage (Out)", "Shrinkage (In)", "Shrinkage (Out)", "Loss (In)", "Loss (Out)", "Total (In)", "Total (Out)", "Running Balance (Total kg)"]];
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
    sheetsData.push({ tabName: "Byproducts Ledger", facilityName: settings.facilityName, reportKind: "CONSOLIDATED BYPRODUCTS LEDGER", timeframeStr, dataRows: bypRows, numCols: 17 });"""
code = re.sub(pattern_exp2, replace_exp2, code)

with open('src/views.tsx', 'w') as f:
    f.write(code)

