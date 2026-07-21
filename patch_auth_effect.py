with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "useEffect(() => {" in line:
        if i + 1 < len(lines) and "if (!auth) return;" in lines[i+1]:
            start_idx = i
    if start_idx != -1 and i > start_idx and "}, []);" in line:
        end_idx = i + 1
        break

if start_idx != -1 and end_idx != -1:
    new_effect = """  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setFbUser(u);
      if (u) {
        setCloudStatus('connected');
        try {
          const userDocRef = doc(db, 'users', u.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUser({ id: u.uid, role: userData.role, label: userData.label, username: u.email });
            const availableTabs = ROLE_PERMISSIONS[userData.role] || [];
            setActiveTab(availableTabs[0]);
          }
        } catch (e) {
          console.error("Failed to fetch user profile", e);
        }
      } else {
        setUser(null);
        setCloudStatus('offline');
      }
    });
    return () => unsubscribe();
  }, []);
"""
    lines[start_idx:end_idx] = [new_effect]
    with open('src/App.tsx', 'w') as f:
        f.writelines(lines)
    print("Effect patched!")
else:
    print(f"Failed. start: {start_idx}, end: {end_idx}")
