import re

with open('src/views.tsx', 'r') as f:
    code = f.read()

# 1. Update the table header
old_header = """                  <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Additions (In)</th>
                  <th className="p-3 font-semibold border-r border-amber-200 text-right text-red-700">Milled Rice (Out)</th>
                  <th className="p-3 font-semibold border-r border-amber-200 text-right text-red-700">Byproduct (Out)</th>"""
new_header = """                  <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Additions (In)</th>
                  <th className="p-3 font-semibold border-r border-amber-200 text-right text-red-700">Milled Rice (Out)</th>
                  <th className="p-3 font-semibold border-r border-amber-200 text-right text-red-700">Milled Rice (Out) Bags</th>
                  <th className="p-3 font-semibold border-r border-amber-200 text-right text-red-700">Byproduct (Out)</th>"""
if old_header in code:
    code = code.replace(old_header, new_header)
    print("Patched header")
else:
    print("Could not find old_header")

# 2. Update the Beginning Balance row
old_beg = """                  <td className="p-3 border-r border-amber-100 text-right text-gray-400 font-mono text-xs">--</td>
                  <td className="p-3 border-r border-amber-100 text-right text-gray-400 font-mono text-xs">--</td>
                  <td className="p-3 border-r border-amber-100 text-right text-gray-400 font-mono text-xs">--</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-900">{metrics.wip.beg.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</td>"""
new_beg = """                  <td className="p-3 border-r border-amber-100 text-right text-gray-400 font-mono text-xs">--</td>
                  <td className="p-3 border-r border-amber-100 text-right text-gray-400 font-mono text-xs">--</td>
                  <td className="p-3 border-r border-amber-100 text-right text-gray-400 font-mono text-xs">--</td>
                  <td className="p-3 border-r border-amber-100 text-right text-gray-400 font-mono text-xs">--</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-900">{metrics.wip.beg.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</td>"""
if old_beg in code:
    code = code.replace(old_beg, new_beg)
    print("Patched beginning balance row")
else:
    print("Could not find old_beg")

# 3. Update the mapping row
old_row = """                    <td className="p-3 border-r border-amber-100 text-right font-mono font-medium text-emerald-700">{move.in > 0 ? `+${move.in.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg` : '-'}</td>
                    <td className="p-3 border-r border-amber-100 text-right font-mono font-medium text-red-700">{move.outRice > 0 ? `-${move.outRice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg` : '-'}</td>
                    <td className="p-3 border-r border-amber-100 text-right font-mono font-medium text-red-700">{move.outByproduct > 0 ? `-${move.outByproduct.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg` : '-'}</td>"""
new_row = """                    <td className="p-3 border-r border-amber-100 text-right font-mono font-medium text-emerald-700">{move.in > 0 ? `+${move.in.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg` : '-'}</td>
                    <td className="p-3 border-r border-amber-100 text-right font-mono font-medium text-red-700">{move.outRice > 0 ? `-${move.outRice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg` : '-'}</td>
                    <td className="p-3 border-r border-amber-100 text-right font-mono font-medium text-red-700">{move.outRiceBags > 0 ? `-${move.outRiceBags.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} Bags` : '-'}</td>
                    <td className="p-3 border-r border-amber-100 text-right font-mono font-medium text-red-700">{move.outByproduct > 0 ? `-${move.outByproduct.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg` : '-'}</td>"""
if old_row in code:
    code = code.replace(old_row, new_row)
    print("Patched moves row")
else:
    print("Could not find old_row")

# 4. Update the total period summary row
old_summary = """                  <td className="p-3 border-r border-amber-300 text-right font-mono font-bold text-emerald-700">+{metrics.wip.in.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</td>
                  <td className="p-3 border-r border-amber-300 text-right font-mono font-bold text-red-700">-{metrics.wip.outRice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</td>
                  <td className="p-3 border-r border-amber-300 text-right font-mono font-bold text-red-700">-{metrics.wip.outByproduct.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</td>"""
new_summary = """                  <td className="p-3 border-r border-amber-300 text-right font-mono font-bold text-emerald-700">+{metrics.wip.in.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</td>
                  <td className="p-3 border-r border-amber-300 text-right font-mono font-bold text-red-700">-{metrics.wip.outRice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</td>
                  <td className="p-3 border-r border-amber-300 text-right font-mono font-bold text-red-700">-{metrics.wip.outRiceBags.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} Bags</td>
                  <td className="p-3 border-r border-amber-300 text-right font-mono font-bold text-red-700">-{metrics.wip.outByproduct.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg</td>"""
if old_summary in code:
    code = code.replace(old_summary, new_summary)
    print("Patched summary row")
else:
    print("Could not find old_summary")

with open('src/views.tsx', 'w') as f:
    f.write(code)

