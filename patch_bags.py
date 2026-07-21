import re

with open('src/views.tsx', 'r') as f:
    code = f.read()

old_prod = """    (data[TABS.PRODUCTION] || []).forEach(r => {
      const { isBefore, isWithin } = checkDate(r.date);
      const isMilledRice = true;
      const bagSize = r.bagSize || '50kgs';
      const bags = parseFloat(r.bags) || 0;
      const totalRiceWeight = bags * getBagWeight(bagSize);"""
new_prod = """    (data[TABS.PRODUCTION] || []).forEach(r => {
      const { isBefore, isWithin } = checkDate(r.date);
      const isMilledRice = true;
      const bagSize = r.bagSize || '50kgs';
      const bags = parseFloat(r.outputBags) || 0;
      const totalRiceWeight = bags * getBagWeight(bagSize);"""

if old_prod in code:
    code = code.replace(old_prod, new_prod)
    print("Patched TABS.PRODUCTION bags")
else:
    print("Could not find old_prod")

with open('src/views.tsx', 'w') as f:
    f.write(code)

