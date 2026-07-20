import re

with open('src/utils.ts', 'r') as f:
    code = f.read()

old_settings = """export const initialSettings = {
  facilityName: "Isabela Rice Processing Complex",
  accounts: [
    { id: 'a1', role: ROLES.ACCOUNTING, label: 'Administrator', username: 'admin', passcode: 'admin123' },
    { id: 'a2', role: ROLES.PURCHASE, label: 'Purchasing Dept', username: 'purchase', passcode: 'pur123' },
    { id: 'a3', role: ROLES.PRODUCTION, label: 'Production Dept', username: 'production', passcode: 'prod123' },
    { id: 'a4', role: ROLES.OBSERVER, label: 'Observer 1', username: 'obs1', passcode: 'obs123' },
    { id: 'a5', role: ROLES.OBSERVER, label: 'Observer 2', username: 'obs2', passcode: 'obs123' },
    { id: 'a6', role: ROLES.OBSERVER, label: 'Observer 3', username: 'obs3', passcode: 'obs123' },
    { id: 'a7', role: ROLES.OBSERVER, label: 'Observer 4', username: 'obs4', passcode: 'obs123' }
  ],
  bagSizes: DEFAULT_BAG_SIZES,
  warehouses: DEFAULT_WAREHOUSES
};"""

new_settings = """export const initialSettings = {
  facilityName: "Isabela Rice Processing Complex",
  bagSizes: DEFAULT_BAG_SIZES,
  warehouses: DEFAULT_WAREHOUSES
};"""

if old_settings in code:
    code = code.replace(old_settings, new_settings)
    print("Patched initialSettings")

old_migrate = """  if (!rawSettings.accounts) {
    newSettings.accounts = initialSettings.accounts;
  }"""

if old_migrate in code:
    code = code.replace(old_migrate, "")
    print("Patched migrateSettings")

with open('src/utils.ts', 'w') as f:
    f.write(code)
