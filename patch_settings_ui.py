with open('src/components.tsx', 'r') as f:
    lines = f.readlines()

start = -1
end = -1

for i, line in enumerate(lines):
    if "User Account Management" in line:
        start = i - 4 # Include the <div className="pt-4 ..."> and <div className="flex justify-between ...">
    if "System Data Backups" in line and start != -1:
        end = i - 2 # Exclude the <div className="pt-4 ..."> for backups
        break

if start != -1 and end != -1:
    del lines[start:end]
    with open('src/components.tsx', 'w') as f:
        f.writelines(lines)
    print("Settings UI patched successfully")
else:
    print(f"Could not find blocks. start: {start}, end: {end}")
