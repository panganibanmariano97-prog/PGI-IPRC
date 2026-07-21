import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

orig_prod_add = "onAddRow={() => handleOpenAddModal(TABS.PRODUCTION)}"
new_prod_add = "onAddRow={canEditTab(TABS.PRODUCTION) ? () => handleOpenAddModal(TABS.PRODUCTION) : undefined}"
content = content.replace(orig_prod_add, new_prod_add)

orig_byp_add = "onAddRow={() => handleOpenAddModal(TABS.BYPRODUCTS)}"
new_byp_add = "onAddRow={canEditTab(TABS.BYPRODUCTS) ? () => handleOpenAddModal(TABS.BYPRODUCTS) : undefined}"
content = content.replace(orig_byp_add, new_byp_add)

orig_act_add = "onAddRow={() => handleOpenAddModal(activeTab)}"
new_act_add = "onAddRow={canEditTab(activeTab) ? () => handleOpenAddModal(activeTab) : undefined}"
content = content.replace(orig_act_add, new_act_add)

with open('src/App.tsx', 'w') as f:
    f.write(content)
