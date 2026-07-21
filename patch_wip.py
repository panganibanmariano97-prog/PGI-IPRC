import re

with open('src/views.tsx', 'r') as f:
    content = f.read()

wip_logic = """
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
          m.wip.moves.push({ id: r.id, date: r.date, type: 'Production Output', desc: `Batch: ${r.batchRef}`, in: 0, outRice: outputRice, outRiceBags: bags, outByproduct: byproductVal });
              
          m.rice.in += totalRiceWeight;
          m.rice.inBags += bags;
          m.rice.moves.push({ id: r.id, date: r.date, type: 'Production Output', desc: `Batch: ${r.batchRef} (${bagSize})`, in: totalRiceWeight, out: 0, inBags: bags, outBags: 0 });
        }
      }
"""

content = re.sub(
    r"""      if \(isBefore\) \{\s*m\.wip\.beg -= inputPalay;\s*if \(includeInRice\) \{ m\.rice\.beg \+= totalRiceWeight; m\.rice\.begBags \+= bags; \}\s*\}\s*if \(isWithin\) \{\s*m\.wip\.outRice \+= outputRice;\s*m\.wip\.outRiceBags \+= bags;\s*m\.wip\.outByproduct \+= byproductVal;\s*m\.wip\.moves\.push\(\{ id: r\.id, date: r\.date, type: 'Production Output', desc: `Batch: \$\{r\.batchRef\}`, in: 0, outRice: outputRice, outRiceBags: bags, outByproduct: byproductVal \}\);\s*if \(includeInRice\) \{\s*m\.rice\.in \+= totalRiceWeight;\s*m\.rice\.inBags \+= bags;\s*m\.rice\.moves\.push\(\{ id: r\.id, date: r\.date, type: 'Production Output', desc: `Batch: \$\{r\.batchRef\} \(\$\{bagSize\}\)`, in: totalRiceWeight, out: 0, inBags: bags, outBags: 0 \}\);\s*\}\s*\}""",
    wip_logic.strip(),
    content
)

with open('src/views.tsx', 'w') as f:
    f.write(content)
