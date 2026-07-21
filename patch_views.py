import re

with open('src/views.tsx', 'r') as f:
    content = f.read()

# WIP Palay (Milling Facility) string changes
content = content.replace('"Milled Rice (Out) (kg)"', '"Deductions (Out) (kg)"')
content = content.replace('"Milled Rice (Out) (Bags)"', '"Deductions (Out) (Bags)"')
content = content.replace('>Milled Rice (Out)</th>', '>Deductions (Out)</th>')
content = content.replace('>Milled Rice (Out) Bags</th>', '>Deductions (Out) Bags</th>')

# Consolidated byproducts ledger additions
byp_th_orig = """                      {showLoss && <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Loss</th>}
                      <th className="p-3 font-semibold text-right text-emerald-900">Running Balance (Total kg)</th>"""

byp_th_new = """                      {showLoss && <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Loss</th>}
                      <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Additions (In)</th>
                      <th className="p-3 font-semibold border-r border-amber-200 text-right text-red-700">Deductions (Out)</th>
                      <th className="p-3 font-semibold text-right text-emerald-900">Running Balance (Total kg)</th>"""

content = content.replace(byp_th_orig, byp_th_new)

byp_td_orig1 = """                      {showLoss && <td className="p-3 border-r border-amber-100 text-right font-mono">{catMetrics.beg.loss.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>}
                      <td className="p-3 text-right font-mono font-bold text-emerald-900">{catMetrics.beg.total.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>"""

byp_td_new1 = """                      {showLoss && <td className="p-3 border-r border-amber-100 text-right font-mono">{catMetrics.beg.loss.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>}
                      <td className="p-3 border-r border-amber-100 text-right font-mono text-gray-400">--</td>
                      <td className="p-3 border-r border-amber-100 text-right font-mono text-gray-400">--</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-900">{catMetrics.beg.total.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>"""

content = content.replace(byp_td_orig1, byp_td_new1)

byp_td_orig2 = """                          {showLoss && <td className="p-3 border-r border-amber-100 text-right font-mono font-medium">{renderNet(netLoss)}</td>}
                          <td className="p-3 text-right font-mono font-semibold text-emerald-900">{move.balance.total.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>"""

byp_td_new2 = """                          {showLoss && <td className="p-3 border-r border-amber-100 text-right font-mono font-medium">{renderNet(netLoss)}</td>}
                          <td className="p-3 border-r border-amber-100 text-right font-mono font-medium text-emerald-700">{move.in.total > 0 ? `+${move.in.total.toLocaleString()}` : '-'}</td>
                          <td className="p-3 border-r border-amber-100 text-right font-mono font-medium text-red-700">{move.out.total > 0 ? `-${move.out.total.toLocaleString()}` : '-'}</td>
                          <td className="p-3 text-right font-mono font-semibold text-emerald-900">{move.balance.total.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>"""

content = content.replace(byp_td_orig2, byp_td_new2)


with open('src/views.tsx', 'w') as f:
    f.write(content)

