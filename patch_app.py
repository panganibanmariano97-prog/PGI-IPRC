import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# Replace the __firebase_config initialization block
old_init = """let app, auth, db;
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'isabela-rice-app';

try {
  if (firebaseConfig && !FORCE_OFFLINE) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else if (FORCE_OFFLINE) {
    console.info("Running in Forced Offline Mode. Cloud sync network requests are safely disabled.");
  }
} catch (e) {
  console.warn("Cloud Storage Setup Incomplete. Falling back to Local Memory.");
}"""

new_init = """let app, auth, db, analytics;
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

code = code.replace(old_init, new_init)

# Add getAnalytics import
import_pattern = r"import { initializeApp } from 'firebase/app';"
new_import = "import { initializeApp } from 'firebase/app';\nimport { getAnalytics } from 'firebase/analytics';"

if import_pattern in code:
    code = code.replace(import_pattern, new_import)

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("App.tsx patched successfully!")
