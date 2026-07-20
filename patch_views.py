import re

with open('src/views.tsx', 'r') as f:
    code = f.read()

# ProductionDashboardView
code = code.replace("export const ProductionDashboardView = ({ filteredData, columns, onUpdate, onAddRow, onDeleteRow, readOnly, bagSizes }) => {",
"export const ProductionDashboardView = ({ filteredData, columns, onUpdate, onAddRow, onDeleteRow, onEditRow, readOnly, bagSizes }) => {")

code = code.replace("onUpdate={(rowId, field, value) => onUpdate(TABS.PRODUCTION, rowId, field, value)}\n          onAddRow={onAddRow}\n          onDeleteRow={onDeleteRow}",
"onUpdate={(rowId, field, value) => onUpdate(TABS.PRODUCTION, rowId, field, value)}\n          onAddRow={onAddRow}\n          onDeleteRow={onDeleteRow}\n          onEditRow={onEditRow}")

# ByproductDashboardView
code = code.replace("export const ByproductDashboardView = ({ filteredData, columns, onUpdate, onAddRow, onDeleteRow, userRole }) => {",
"export const ByproductDashboardView = ({ filteredData, columns, onUpdate, onAddRow, onDeleteRow, onEditRow, userRole }) => {")

code = code.replace("onUpdate={(rowIndex, field, value) => onUpdate(TABS.BYPRODUCTS, rowIndex, field, value)}\n          onAddRow={() => onAddRow(TABS.BYPRODUCTS)}\n          onDeleteRow={onDeleteRow}",
"onUpdate={(rowIndex, field, value) => onUpdate(TABS.BYPRODUCTS, rowIndex, field, value)}\n          onAddRow={() => onAddRow(TABS.BYPRODUCTS)}\n          onDeleteRow={onDeleteRow}\n          onEditRow={onEditRow}")

with open('src/views.tsx', 'w') as f:
    f.write(code)
