import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

orig_prod_del = "onDeleteRow={(rowId) => handleDeleteRow(TABS.PRODUCTION, rowId)}"
new_prod_del = "onDeleteRow={canEditTab(TABS.PRODUCTION) ? (rowId) => handleDeleteRow(TABS.PRODUCTION, rowId) : undefined}"
content = content.replace(orig_prod_del, new_prod_del)

orig_byp_del = "onDeleteRow={(rowId) => handleDeleteRow(TABS.BYPRODUCTS, rowId)}"
new_byp_del = "onDeleteRow={canEditTab(TABS.BYPRODUCTS) ? (rowId) => handleDeleteRow(TABS.BYPRODUCTS, rowId) : undefined}"
content = content.replace(orig_byp_del, new_byp_del)

orig_act_del = "onDeleteRow={(rowId) => handleDeleteRow(activeTab, rowId)}"
new_act_del = "onDeleteRow={canEditTab(activeTab) ? (rowId) => handleDeleteRow(activeTab, rowId) : undefined}"
content = content.replace(orig_act_del, new_act_del)

with open('src/App.tsx', 'w') as f:
    f.write(content)
