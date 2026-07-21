import re

with open('src/views.tsx', 'r') as f:
    code = f.read()

old_auth = "  const isAuthorized = userRole === ROLES.ACCOUNTING || userRole === ROLES.PRODUCTION;"
new_auth = "  const isAuthorized = userRole === ROLES.ADMINISTRATOR || userRole === ROLES.PRODUCTION;"

if old_auth in code:
    code = code.replace(old_auth, new_auth)
    print("Patched isAuthorized")
else:
    print("Could not find old_auth")

with open('src/views.tsx', 'w') as f:
    f.write(code)
