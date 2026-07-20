import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# 1. Update imports
import_fs_old = "import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';"
import_fs_new = "import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';"
code = code.replace(import_fs_old, import_fs_new)

import_auth_old = "import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';"
import_auth_new = "import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';"
code = code.replace(import_auth_old, import_auth_new)

# 2. Update onAuthStateChanged
auth_effect_old = """  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setFbUser(u);
      if (u) setCloudStatus('connected');
    });
    return () => unsubscribe();
  }, []);"""

auth_effect_new = """  useEffect(() => {
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
code = code.replace(auth_effect_old, auth_effect_new)

# 3. Remove handleLogin and handleSignUp
login_funcs = """  const handleLogin = (authenticatedUser) => {
    setUser(authenticatedUser);
    const availableTabs = ROLE_PERMISSIONS[authenticatedUser.role];
    setActiveTab(availableTabs[0]);
  };

  const handleSignUp = (newAccount) => {
    const newSettings = { ...settings };
    const newAccounts = [...(newSettings.accounts || []), newAccount];
    newSettings.accounts = newAccounts;
    syncCloudState(data, newSettings);
    handleLogin(newAccount);
  };"""
code = code.replace(login_funcs, "")

# 4. Render <Login />
login_render = "<Login onLogin={handleLogin} onSignUp={handleSignUp} accounts={settings.accounts || []} />"
code = code.replace(login_render, "<Login />")

# 5. Update logout button
logout_old = """          <button 
            onClick={() => setUser(null)}
            className="flex items-center px-4 py-2.5 bg-white text-emerald-800 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all shadow-sm border border-amber-300 shrink-0"
          >
            <LogOut size={14} className="mr-1.5" />
            Logout / Exit Session
          </button>"""
logout_new = """          <button 
            onClick={() => signOut(auth)}
            className="flex items-center px-4 py-2.5 bg-white text-emerald-800 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all shadow-sm border border-amber-300 shrink-0"
          >
            <LogOut size={14} className="mr-1.5" />
            Logout / Exit Session
          </button>"""
code = code.replace(logout_old, logout_new)

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("App.tsx patched 3")
