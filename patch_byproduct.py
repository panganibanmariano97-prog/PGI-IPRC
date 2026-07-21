import re

with open('src/views.tsx', 'r') as f:
    content = f.read()

# Filter logic for the UI array
filter_logic = """
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
"""
content = content.replace("{catMetrics.moves.map((move, idx) => {", filter_logic.strip())

# Filter logic for the export array
export_filter_logic = """
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
"""
content = content.replace("metrics.byproducts.moves.forEach(m => dataRows.push([", export_filter_logic.strip())

with open('src/views.tsx', 'w') as f:
    f.write(content)
