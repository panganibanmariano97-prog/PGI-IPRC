import re

with open('src/views.tsx', 'r') as f:
    content = f.read()

new_block = """          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Palay Purchased</p>
            <p className="text-xl font-black text-emerald-900">{stats.totalPurchasedPalay.toLocaleString()} kg</p>
            <div className="flex justify-between items-center mt-0.5">
              <p className="text-xs text-emerald-700/80 font-bold">Cost: ₱{stats.totalPurchasedCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-emerald-700/80 font-bold bg-emerald-50 px-2 py-0.5 rounded">Avg: ₱{stats.averagePricePerKg}/kg</p>
            </div>
          </div>"""

content = re.sub(
    r"""          <div>\s*<p className="text-xs font-bold uppercase tracking-wider text-amber-800">Palay Purchased</p>\s*<p className="text-xl font-black text-emerald-900">\{stats.totalPurchasedPalay.toLocaleString\(\)\} kg</p>\s*<p className="text-xs text-emerald-700/80 mt-0.5 font-bold">Cost: ₱\{stats.totalPurchasedCost.toLocaleString\(undefined, \{ maximumFractionDigits: 0 \}\)\} \| Avg: ₱\{stats.averagePricePerKg\}/kg</p>\s*</div>""",
    new_block,
    content
)

with open('src/views.tsx', 'w') as f:
    f.write(content)

