import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

new_props = """  const canEditTab = (tab) => {
    if (isReadOnly) return false;
    if (user.role === ROLES.ADMINISTRATOR) return true;
    if (user.role === ROLES.PURCHASE) return tab === TABS.PURCHASE;
    if (user.role === ROLES.PRODUCTION) {
      return [TABS.TRANSFER, TABS.PRODUCTION, TABS.ISSUANCE, TABS.BYPRODUCTS].includes(tab);
    }
    return false;
  };

  const tabIcons = {"""

content = content.replace("  const tabIcons = {", new_props)

orig_prod = "onEditRow={(row) => handleOpenEditModal(TABS.PRODUCTION, row)}"
new_prod = "onEditRow={canEditTab(TABS.PRODUCTION) ? (row) => handleOpenEditModal(TABS.PRODUCTION, row) : undefined}"
content = content.replace(orig_prod, new_prod)

orig_byproducts = "onEditRow={(row) => handleOpenEditModal(TABS.BYPRODUCTS, row)}"
new_byproducts = "onEditRow={canEditTab(TABS.BYPRODUCTS) ? (row) => handleOpenEditModal(TABS.BYPRODUCTS, row) : undefined}"
content = content.replace(orig_byproducts, new_byproducts)

orig_active = "onEditRow={(row) => handleOpenEditModal(activeTab, row)}"
new_active = "onEditRow={canEditTab(activeTab) ? (row) => handleOpenEditModal(activeTab, row) : undefined}"
content = content.replace(orig_active, new_active)

with open('src/App.tsx', 'w') as f:
    f.write(content)
