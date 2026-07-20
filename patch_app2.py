import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Remove firebase init from App.tsx
old_init = """let app, auth, db, analytics;
const firebaseConfig = {
  apiKey: "AIzaSyAgxT_kUs27Re-auJw9BlT1egfuu7k0wD8",
  authDomain: "pgi-irpc.firebaseapp.com",
  projectId: "pgi-irpc",
  storageBucket: "pgi-irpc.firebasestorage.app",
  messagingSenderId: "1069107893671",
  appId: "1:1069107893671:web:2c1b0cf55d413f4606d282",
  measurementId: "G-E1HR79Y0VD"
};
const appId = 'pgi-irpc';

try {
  if (!FORCE_OFFLINE) {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    console.info("Running in Forced Offline Mode. Cloud sync network requests are safely disabled.");
  }
} catch (e) {
  console.warn("Cloud Storage Setup Incomplete. Falling back to Local Memory.");
}"""

new_init = """import { app, auth, db, analytics } from './firebase';
const appId = 'pgi-irpc';
"""

if old_init in code:
    code = code.replace(old_init, new_init)
    print("Replaced old_init")
else:
    print("Could not find old_init")

# Now update useEffect that syncs cloud state
# Wait, no need to change that.

with open('src/App.tsx', 'w') as f:
    f.write(code)
