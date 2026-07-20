with open('src/components.tsx', 'r') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '<div className="pt-4 border-t border-amber-100">' in line:
        # Check if the next few lines have User Account Management
        if i + 3 < len(lines) and "User Account Management" in lines[i + 3]:
            start_idx = i
    if '<div className="mt-8 pt-6 border-t-2 border-amber-200">' in line:
        if start_idx != -1:
            end_idx = i
            break

if start_idx != -1 and end_idx != -1:
    del lines[start_idx:end_idx]
    with open('src/components.tsx', 'w') as f:
        f.writelines(lines)
    print("Settings UI patched!")
else:
    print(f"Failed. Start: {start_idx}, End: {end_idx}")
