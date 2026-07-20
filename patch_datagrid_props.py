import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# For TABS.PRODUCTION, TABS.BYPRODUCTS, and activeTab
code = code.replace("onUpdate={handleDataUpdate}\n                  onAddRow={() => handleAddRow(TABS.PRODUCTION)}",
"onUpdate={handleDataUpdate}\n                  onAddRow={() => handleOpenAddModal(TABS.PRODUCTION)}\n                  onEditRow={(row) => handleOpenEditModal(TABS.PRODUCTION, row)}")

code = code.replace("onUpdate={handleDataUpdate}\n                  onAddRow={() => handleAddRow(TABS.BYPRODUCTS)}",
"onUpdate={handleDataUpdate}\n                  onAddRow={() => handleOpenAddModal(TABS.BYPRODUCTS)}\n                  onEditRow={(row) => handleOpenEditModal(TABS.BYPRODUCTS, row)}")

code = code.replace("onUpdate={(rowId, field, value) => handleDataUpdate(activeTab, rowId, field, value)}\n                  onAddRow={() => handleAddRow(activeTab)}",
"onUpdate={(rowId, field, value) => handleDataUpdate(activeTab, rowId, field, value)}\n                  onAddRow={() => handleOpenAddModal(activeTab)}\n                  onEditRow={(row) => handleOpenEditModal(activeTab, row)}")


# Also need to add TransactionModal in JSX
modal_jsx = """      {txModal.isOpen && (
        <TransactionModal
          isOpen={txModal.isOpen}
          title={txModal.isEdit ? `Edit ${txModal.tab} Transaction` : `Add ${txModal.tab} Transaction`}
          columns={getColumns(settings.bagSizes || DEFAULT_BAG_SIZES, settings.warehouses || DEFAULT_WAREHOUSES)[txModal.tab] || []}
          initialData={txModal.row}
          onSave={handleSaveTx}
          onClose={() => setTxModal({ isOpen: false, row: null, tab: null, isEdit: false })}
        />
      )}
"""
code = code.replace("{showDuplicateModal && (", modal_jsx + "      {showDuplicateModal && (")


with open('src/App.tsx', 'w') as f:
    f.write(code)
