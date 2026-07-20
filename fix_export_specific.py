import re

with open('src/views.tsx', 'r') as f:
    code = f.read()

pattern = r"if \(type === 'byproducts'\) \{[\s\S]*?\}\n\n    exportToStyledXLSX\("

replacement = r"""if (type === 'byproducts') {
      title = 'CONSOLIDATED BYPRODUCTS LEDGER';
      numCols = 17;
      
      dataRows.push(["Category Summary"]);
      dataRows.push(["Beginning Balance (kg)", "Additions (In) (kg)", "Deductions (Out) (kg)", "Ending Balance (kg)"]);
      dataRows.push([fmtQty(metrics.byproducts.beg.total), fmtQty(metrics.byproducts.in.total), fmtQty(metrics.byproducts.out.total), fmtQty(metrics.byproducts.end.total)]);
      dataRows.push([]);
      
      dataRows.push(["Detailed Daily Movement Ledger"]);
      dataRows.push(["Date", "Action / Reference", "Rice Hull (In)", "Rice Hull (Out)", "Rice Bran (In)", "Rice Bran (Out)", "Brewer (In)", "Brewer (Out)", "Spoilage (In)", "Spoilage (Out)", "Shrinkage (In)", "Shrinkage (Out)", "Loss (In)", "Loss (Out)", "Total (In)", "Total (Out)", "Running Balance (Total kg)"]);
      
      metrics.byproducts.moves.forEach(m => dataRows.push([
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
    }

    exportToStyledXLSX("""

code = re.sub(pattern, replacement, code)

with open('src/views.tsx', 'w') as f:
    f.write(code)

