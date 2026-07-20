import re

with open('src/views.tsx', 'r') as f:
    code = f.read()

pattern = r"\{BYPRODUCT_CATEGORIES\.map\(cat => \{[\s\S]*?return \([\s\S]*?\}\)\}"

replacement = r"""{(() => {
          const catMetrics = metrics.byproducts;
          return (
            <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm mt-8">
              <div className="bg-amber-800 px-4 py-3 border-b-4 border-amber-50 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-amber-300 text-[15px]">Consolidated Byproducts Ledger</h4>
                </div>
                {canExport && (
                  <button onClick={() => handleExportSpecific('byproducts')} className="flex items-center px-3 py-1.5 bg-amber-600 text-yellow-100 rounded text-[10px] font-bold hover:bg-amber-500 transition-all shadow-sm active:scale-95 whitespace-nowrap">
                    <Download size={14} className="mr-1.5" />
                    Export .xlsx
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-amber-50 text-emerald-900 text-[11px] border-b border-amber-200">
                      <th className="p-3 font-semibold border-r border-amber-200 w-[10%]">Date</th>
                      <th className="p-3 font-semibold border-r border-amber-200 w-[15%]">Movement Details</th>
                      <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Rice Hull</th>
                      <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Rice Bran</th>
                      <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Brewer</th>
                      <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Spoilage</th>
                      <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Shrinkage</th>
                      <th className="p-3 font-semibold border-r border-amber-200 text-right text-emerald-700">Loss</th>
                      <th className="p-3 font-semibold text-right text-emerald-900">Running Balance (Total kg)</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px] text-emerald-950">
                    <tr className="bg-gray-50/50">
                      <td className="p-3 border-r border-amber-100 text-gray-500 font-semibold text-center font-mono">{beginningDateStr}</td>
                      <td className="p-3 border-r border-amber-100 text-emerald-800 font-bold">Beginning Balance</td>
                      <td className="p-3 border-r border-amber-100 text-right font-mono">{catMetrics.beg.riceHull.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>
                      <td className="p-3 border-r border-amber-100 text-right font-mono">{catMetrics.beg.riceBran.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>
                      <td className="p-3 border-r border-amber-100 text-right font-mono">{catMetrics.beg.brewer.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>
                      <td className="p-3 border-r border-amber-100 text-right font-mono">{catMetrics.beg.spoilage.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>
                      <td className="p-3 border-r border-amber-100 text-right font-mono">{catMetrics.beg.shrinkage.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>
                      <td className="p-3 border-r border-amber-100 text-right font-mono">{catMetrics.beg.loss.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-900">{catMetrics.beg.total.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>
                    </tr>
                    {catMetrics.moves.map((move, idx) => {
                      const netRiceHull = move.in.riceHull - move.out.riceHull;
                      const netRiceBran = move.in.riceBran - move.out.riceBran;
                      const netBrewer = move.in.brewer - move.out.brewer;
                      const netSpoilage = move.in.spoilage - move.out.spoilage;
                      const netShrinkage = move.in.shrinkage - move.out.shrinkage;
                      const netLoss = move.in.loss - move.out.loss;
                      
                      const renderNet = (val) => {
                        if (val === 0) return '-';
                        return <span className={val > 0 ? "text-emerald-700" : "text-red-700"}>{val > 0 ? `+${val}` : val} kg</span>;
                      };

                      return (
                        <tr key={`byp-${move.id || idx}-${move.type}`} className="hover:bg-amber-50/40 transition-colors border-t border-dashed border-amber-100">
                          <td className="p-3 border-r border-amber-100 font-mono text-gray-600">{formatToMMDDYYYY(move.date)}</td>
                          <td className="p-3 border-r border-amber-100"><span className="font-bold text-amber-800">{move.type}</span> <span className="text-gray-500 ml-1">{move.desc}</span></td>
                          <td className="p-3 border-r border-amber-100 text-right font-mono font-medium">{renderNet(netRiceHull)}</td>
                          <td className="p-3 border-r border-amber-100 text-right font-mono font-medium">{renderNet(netRiceBran)}</td>
                          <td className="p-3 border-r border-amber-100 text-right font-mono font-medium">{renderNet(netBrewer)}</td>
                          <td className="p-3 border-r border-amber-100 text-right font-mono font-medium">{renderNet(netSpoilage)}</td>
                          <td className="p-3 border-r border-amber-100 text-right font-mono font-medium">{renderNet(netShrinkage)}</td>
                          <td className="p-3 border-r border-amber-100 text-right font-mono font-medium">{renderNet(netLoss)}</td>
                          <td className="p-3 text-right font-mono font-semibold text-emerald-900">{move.balance.total.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-amber-100/50 border-t-2 border-amber-300">
                      <td className="p-3 border-r border-amber-300 text-emerald-900 font-bold" colSpan={2}>Total Period Summary (Net)</td>
                      <td className="p-3 border-r border-amber-300 text-right font-mono font-bold text-emerald-700">{(catMetrics.in.riceHull - catMetrics.out.riceHull).toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>
                      <td className="p-3 border-r border-amber-300 text-right font-mono font-bold text-emerald-700">{(catMetrics.in.riceBran - catMetrics.out.riceBran).toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>
                      <td className="p-3 border-r border-amber-300 text-right font-mono font-bold text-emerald-700">{(catMetrics.in.brewer - catMetrics.out.brewer).toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>
                      <td className="p-3 border-r border-amber-300 text-right font-mono font-bold text-emerald-700">{(catMetrics.in.spoilage - catMetrics.out.spoilage).toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>
                      <td className="p-3 border-r border-amber-300 text-right font-mono font-bold text-emerald-700">{(catMetrics.in.shrinkage - catMetrics.out.shrinkage).toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>
                      <td className="p-3 border-r border-amber-300 text-right font-mono font-bold text-emerald-700">{(catMetrics.in.loss - catMetrics.out.loss).toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>
                      <td className="p-3 text-right font-mono font-black text-[13px] text-emerald-950">{catMetrics.end.total.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} kg</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}"""

code = re.sub(pattern, replacement, code)

with open('src/views.tsx', 'w') as f:
    f.write(code)

