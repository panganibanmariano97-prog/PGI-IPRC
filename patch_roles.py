import re

with open('src/utils.ts', 'r') as f:
    code = f.read()

old_roles = """export const ROLES = {
  ACCOUNTING: 'Accounting',
  PURCHASE: 'Purchase',
  PRODUCTION: 'Production',
  OBSERVER: 'Observer'
};"""
new_roles = """export const ROLES = {
  ADMINISTRATOR: 'Administrator',
  ACCOUNTING: 'Accounting',
  PURCHASE: 'Purchase',
  PRODUCTION: 'Production',
  OBSERVER: 'Observer'
};"""
if old_roles in code:
    code = code.replace(old_roles, new_roles)
    print("Replaced ROLES")
else:
    print("Could not find old_roles")

old_perms = """export const ROLE_PERMISSIONS = {
  [ROLES.ACCOUNTING]: [TABS.DASHBOARD, TABS.INVENTORY, TABS.PURCHASE, TABS.TRANSFER, TABS.PRODUCTION, TABS.ISSUANCE, TABS.BYPRODUCTS, TABS.OTHERS, TABS.SETTINGS],
  [ROLES.PURCHASE]: [TABS.PURCHASE],
  [ROLES.PRODUCTION]: [TABS.TRANSFER, TABS.PRODUCTION, TABS.ISSUANCE, TABS.BYPRODUCTS, TABS.OTHERS],
  [ROLES.OBSERVER]: [TABS.DASHBOARD, TABS.INVENTORY, TABS.PURCHASE, TABS.TRANSFER, TABS.PRODUCTION, TABS.ISSUANCE, TABS.BYPRODUCTS, TABS.OTHERS]
};"""
new_perms = """export const ROLE_PERMISSIONS = {
  [ROLES.ADMINISTRATOR]: [TABS.DASHBOARD, TABS.INVENTORY, TABS.PURCHASE, TABS.TRANSFER, TABS.PRODUCTION, TABS.ISSUANCE, TABS.BYPRODUCTS, TABS.OTHERS, TABS.SETTINGS],
  [ROLES.ACCOUNTING]: [TABS.DASHBOARD, TABS.INVENTORY, TABS.PURCHASE, TABS.TRANSFER, TABS.PRODUCTION, TABS.ISSUANCE, TABS.BYPRODUCTS, TABS.OTHERS],
  [ROLES.PURCHASE]: [TABS.PURCHASE],
  [ROLES.PRODUCTION]: [TABS.TRANSFER, TABS.PRODUCTION, TABS.ISSUANCE, TABS.BYPRODUCTS, TABS.OTHERS],
  [ROLES.OBSERVER]: [TABS.DASHBOARD, TABS.INVENTORY, TABS.PURCHASE, TABS.TRANSFER, TABS.PRODUCTION, TABS.ISSUANCE, TABS.BYPRODUCTS, TABS.OTHERS]
};"""
if old_perms in code:
    code = code.replace(old_perms, new_perms)
    print("Replaced ROLE_PERMISSIONS")
else:
    print("Could not find old_perms")

with open('src/utils.ts', 'w') as f:
    f.write(code)

with open('src/App.tsx', 'r') as f:
    code2 = f.read()

old_readonly = "  const isReadOnly = user.role === ROLES.OBSERVER;"
new_readonly = "  const isReadOnly = user.role === ROLES.OBSERVER || user.role === ROLES.ACCOUNTING;"
if old_readonly in code2:
    code2 = code2.replace(old_readonly, new_readonly)
    print("Replaced isReadOnly")
else:
    print("Could not find old_readonly")

with open('src/App.tsx', 'w') as f:
    f.write(code2)

with open('src/components.tsx', 'r') as f:
    code3 = f.read()

old_login_options = """                  <option value={ROLES.ACCOUNTING}>Administrator / Accounting</option>
                  <option value={ROLES.PURCHASE}>Purchasing Department</option>"""
new_login_options = """                  <option value={ROLES.ADMINISTRATOR}>Administrator</option>
                  <option value={ROLES.ACCOUNTING}>Accounting</option>
                  <option value={ROLES.PURCHASE}>Purchasing Department</option>"""

if old_login_options in code3:
    code3 = code3.replace(old_login_options, new_login_options)
    print("Replaced login options")
else:
    print("Could not find old_login_options")

with open('src/components.tsx', 'w') as f:
    f.write(code3)

