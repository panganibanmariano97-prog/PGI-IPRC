import re

with open('src/views.tsx', 'r') as f:
    content = f.read()

# Update export
export_orig = """    } else if (type === 'byproducts') {
      title = 'CONSOLIDATED BYPRODUCTS LEDGER';
      numCols = 17;
      dataRows.push(["Category Summary"]);
      dataRows.push(["Beginning Balance (kg)", "Additions (In) (kg)", "Deductions (Out) (kg)", "Ending Balance (kg)"]);
      dataRows.push([fmtQty(metrics.byproducts.beg.total), fmtQty(metrics.byproducts.in.total), fmtQty(metrics.byproducts.out.total), fmtQty(metrics.byproducts.end.total)]);
      dataRows.push([]);
      dataRows.push(["Detailed Daily Movement Ledger"]);
      dataRows.push(["Date", "Action / Reference", "Rice Hull (In)", "Rice Hull (Out)", "Rice Bran (In)", "Rice Bran (Out)", "Brewer (In)", "Brewer (Out)", "Spoilage (In)", "Spoilage (Out)", "Shrinkage (In)", "Shrinkage (Out)", "Loss (In)", "Loss (Out)", "Total (In)", "Total (Out)", "Running Balance (Total kg)"]);
      metrics.byproducts.moves.filter(move => {
        if (!selectedByproductCategory || selectedByproductCategory === 'All') return true;
        if (selectedByproductCategory === 'Rice Hull') return move.in.riceHull !== 0 || move.out.riceHull !== 0;
        if (selectedByproductCategory === 'Rice Bran') return move.in.riceBran !== 0 || move.out.riceBran !== 0;
        if (selectedByproductCategory === 'Brewer') return move.in.brewer !== 0 || move.out.brewer !== 0;
        if (selectedByproductCategory === 'Spoilage (Yellow Rice)') return move.in.spoilage !== 0 || move.out.spoilage !== 0;
        if (selectedByproductCategory === 'Shrinkage') return move.in.shrinkage !== 0 || move.out.shrinkage !== 0;
        if (selectedByproductCategory === 'Loss') return move.in.loss !== 0 || move.out.loss !== 0;
        return true;
      }).forEach(m => dataRows.push([
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
    }"""

export_new = """    } else if (type === 'byproducts') {
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
    }"""

content = content.replace(export_orig, export_new)

with open('src/views.tsx', 'w') as f:
    f.write(content)

