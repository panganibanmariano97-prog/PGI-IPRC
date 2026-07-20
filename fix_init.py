import re

with open('src/utils.ts', 'r') as f:
    code = f.read()

pattern = r"\[TABS\.BYPRODUCTS\]: \[\s*\{ id: generateId\(\), date: '2026-06-15', category: 'Rice Hull', entity: 'Biomass Facility', action: 'Deduct \(Release/Sale\)', quantity: 2000, notes: 'Direct sale' \},\s*\{ id: generateId\(\), date: '2026-06-18', category: 'Rice Bran', entity: 'Alicia Feeds', action: 'Deduct \(Release/Sale\)', quantity: 1500, notes: 'Supplied animal feeds' \},\s*\{ id: generateId\(\), date: '2026-06-21', category: 'Spoilage \(Yellow Rice\)', entity: 'Sieving Team', action: 'Add \(Addition\)', quantity: 500, notes: 'Correction recovery' \},\s*\{ id: generateId\(\), date: '2026-06-22', category: 'Shrinkage', entity: 'Silo Management', action: 'Add \(Addition\)', quantity: 100, notes: 'Moisture calibration' \}\s*\]"

replacement = r"""[TABS.BYPRODUCTS]: [
    { id: generateId(), batchRef: 'REF-001', date: '2026-06-15', entity: 'Biomass Facility', responsibleUser: 'John', action: 'Deduct (Release/Sale)', riceHull: 2000, riceBran: 0, brewer: 0, spoilage: 0, shrinkage: 0, loss: 0, quantity: 2000, notes: 'Direct sale' },
    { id: generateId(), batchRef: 'REF-002', date: '2026-06-18', entity: 'Alicia Feeds', responsibleUser: 'Doe', action: 'Deduct (Release/Sale)', riceHull: 0, riceBran: 1500, brewer: 0, spoilage: 0, shrinkage: 0, loss: 0, quantity: 1500, notes: 'Supplied animal feeds' },
    { id: generateId(), batchRef: 'REF-003', date: '2026-06-21', entity: 'Sieving Team', responsibleUser: 'Jane', action: 'Add (Addition)', riceHull: 0, riceBran: 0, brewer: 0, spoilage: 500, shrinkage: 0, loss: 0, quantity: 500, notes: 'Correction recovery' },
    { id: generateId(), batchRef: 'REF-004', date: '2026-06-22', entity: 'Silo Management', responsibleUser: 'Mark', action: 'Add (Addition)', riceHull: 0, riceBran: 0, brewer: 0, spoilage: 0, shrinkage: 100, loss: 0, quantity: 100, notes: 'Moisture calibration' }
  ]"""

code = re.sub(pattern, replacement, code)

with open('src/utils.ts', 'w') as f:
    f.write(code)

