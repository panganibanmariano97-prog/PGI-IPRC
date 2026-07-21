import re
with open('src/App.tsx', 'r') as f:
    code = f.read()

old_effect = """  useEffect(() => {
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
  }, []);"""

new_effect = """  useEffect(() => {
    if (!auth) return;
    let unsubscribeUser = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setFbUser(u);
      if (u) {
        setCloudStatus('connected');
        const userDocRef = doc(db, 'users', u.uid);
        unsubscribeUser = onSnapshot(userDocRef, (userDocSnap) => {
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUser({ id: u.uid, role: userData.role, label: userData.label, username: u.email });
            const availableTabs = ROLE_PERMISSIONS[userData.role] || [];
            setActiveTab(prev => prev ? prev : availableTabs[0]);
          }
        }, (e) => {
          console.error("Failed to fetch user profile", e);
        });
      } else {
        setUser(null);
        setCloudStatus('offline');
        if (unsubscribeUser) unsubscribeUser();
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);"""

if old_effect in code:
    code = code.replace(old_effect, new_effect)
    print("Effect patched successfully")
else:
    print("Could not find old effect")

with open('src/App.tsx', 'w') as f:
    f.write(code)
