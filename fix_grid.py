import re

with open('src/views.tsx', 'r') as f:
    code = f.read()

pattern = r"\{BYPRODUCT_CATEGORIES\.map\(category => \([\s\S]*?\}\)\}"

replacement = r"""<div className="bg-white p-5 rounded-xl border border-amber-200/60 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-amber-100 pb-3 mb-4">
          <div>
            <h3 className="font-extrabold text-emerald-900 text-md flex items-center">
              <Scale className="text-yellow-500 mr-2" size={18} />
              Consolidated Byproduct Ledger
            </h3>
            <p className="text-xs text-amber-700/80 mt-0.5">
              {isAuthorized 
                ? "Authorized: Double-click or use Arrow Keys to manually modify additions, append rows, or delete existing transaction metrics."
                : "View Only: Only Accounting/Admin and Production Departments can modify or delete byproduct sheets."
              }
            </p>
          </div>
          {isAuthorized && (
            <button
              onClick={onAddRow}
              className="flex items-center px-4 py-2 bg-emerald-800 text-yellow-400 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
            >
              <Plus size={14} className="mr-1.5" />
              Add Entry
            </button>
          )}
        </div>

        <DataGrid
          columns={columns}
          data={filteredData[TABS.BYPRODUCTS] || []}
          readOnly={!isAuthorized}
          onUpdate={(rowId, field, value) => onUpdate(TABS.BYPRODUCTS, rowId, field, value)}
          onAddRow={onAddRow}
          onDeleteRow={onDeleteRow}
        />
      </div>"""

code = re.sub(pattern, replacement, code)

with open('src/views.tsx', 'w') as f:
    f.write(code)

