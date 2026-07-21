import re

with open('src/views.tsx', 'r') as f:
    content = f.read()

stats_calc = """    const averageRecoveryRate = totalInputMilled > 0 
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
"""

content = re.sub(
    r"    const averageRecoveryRate = totalInputMilled > 0 \s*\n\s*\? \(\(totalOutputRiceKg / totalInputMilled\) \* 100\)\.toFixed\(2\)\s*\n\s*: '0\.00';\s*\n\s*\n\s*return \{\s*\n\s*totalPurchasedPalay,\s*\n\s*totalPurchasedCost,\s*\n\s*totalTransferredWeight,",
    stats_calc.strip(),
    content
)

ui_part = """          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Palay Purchased</p>
            <p className="text-xl font-black text-emerald-900">{stats.totalPurchasedPalay.toLocaleString()} kg</p>
            <p className="text-xs text-emerald-700/80 mt-0.5 font-bold">Cost: ₱{stats.totalPurchasedCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} | Avg: ₱{stats.averagePricePerKg}/kg</p>
          </div>"""

content = re.sub(
    r"""          <div>\s*<p className="text-xs font-bold uppercase tracking-wider text-amber-800">Palay Purchased</p>\s*<p className="text-xl font-black text-emerald-900">\{stats.totalPurchasedPalay.toLocaleString\(\)\} kg</p>\s*<p className="text-xs text-emerald-700/80 mt-0.5 font-bold">Cost: ₱\{stats.totalPurchasedCost.toLocaleString\(undefined, \{ maximumFractionDigits: 0 \}\)\}</p>\s*</div>""",
    ui_part.strip(),
    content
)

with open('src/views.tsx', 'w') as f:
    f.write(content)
