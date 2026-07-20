import re

with open('src/components.tsx', 'r') as f:
    code = f.read()

# 1. Add Edit2 import
code = code.replace("Trash2, Plus", "Trash2, Plus, Edit2")

# 2. Add onEditRow to DataGrid signature
code = code.replace("export const DataGrid = ({ columns, data, onUpdate, onAddRow, onDeleteRow, readOnly }) => {",
"export const DataGrid = ({ columns, data, onUpdate, onAddRow, onDeleteRow, onEditRow, readOnly }) => {")

# 3. Change header Action to Actions
code = code.replace("{!readOnly && onDeleteRow && (\n                <th className=\"p-3 w-16 text-center\">Action</th>",
"{!readOnly && (onDeleteRow || onEditRow) && (\n                <th className=\"p-3 w-24 text-center\">Actions</th>")

# 4. Change Action cell rendering
old_action_cell = """              {!readOnly && onDeleteRow && (
                <td className="p-0 border-r border-amber-100 relative">
                  <button
                    onClick={() => onDeleteRow(row.id)}
                    className="absolute inset-0 w-full h-full flex items-center justify-center text-red-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                    title="Delete Row"
                  >
                    <Trash2 size={14} className="mx-auto" />
                  </button>
                </td>
              )}"""

new_action_cell = """              {!readOnly && (onDeleteRow || onEditRow) && (
                <td className="p-2 border-r border-amber-100 relative">
                  <div className="flex items-center justify-center space-x-2">
                    {onEditRow && (
                      <button
                        onClick={() => onEditRow(row)}
                        className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                        title="Edit Row"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    {onDeleteRow && (
                      <button
                        onClick={() => onDeleteRow(row.id)}
                        className="text-red-400 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                        title="Delete Row"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              )}"""
code = code.replace(old_action_cell, new_action_cell)

# 5. Fix tfoot empty cell
code = code.replace("{!readOnly && onDeleteRow && (\n                <td className=\"border-r border-amber-300\"></td>\n              )}",
"{!readOnly && (onDeleteRow || onEditRow) && (\n                <td className=\"border-r border-amber-300\"></td>\n              )}")

# 6. Make all columns readOnly in the grid if onEditRow is provided (we assume onEditRow implies modal editing)
old_is_read_only = "const isReadOnly = readOnly || col.readOnly;"
new_is_read_only = "const isReadOnly = readOnly || col.readOnly || !!onEditRow;"
code = code.replace(old_is_read_only, new_is_read_only)


with open('src/components.tsx', 'w') as f:
    f.write(code)

