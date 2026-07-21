import re

with open('src/components.tsx', 'r') as f:
    content = f.read()

# Add success state
content = content.replace("const [error, setError] = useState('');", "const [error, setError] = useState('');\n  const [success, setSuccess] = useState('');")

# Add success UI
success_ui = """
          {success && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-xs text-green-700 font-medium">
              <span>{success}</span>
            </div>
          )}
"""
content = content.replace("{error && (", success_ui.strip() + "\n          {error && (")

# Clear success on submit
content = content.replace("setError('');\n    setLoading(true);", "setError('');\n    setSuccess('');\n    setLoading(true);")

# Clear success on toggle
content = content.replace("onClick={() => { setIsSignUp(false); setError(''); }}", "onClick={() => { setIsSignUp(false); setError(''); setSuccess(''); }}")
content = content.replace("onClick={() => { setIsSignUp(true); setError(''); }}", "onClick={() => { setIsSignUp(true); setError(''); setSuccess(''); }}")

# Handle sign up logic
sign_up_logic = """
        const userCred = await createUserWithEmailAndPassword(auth, email, passcode);
        await setDoc(doc(db, 'users', userCred.user.uid), {
          role: selectedRole,
          label: label || email,
          email: email
        });
        await auth.signOut();
        setIsSignUp(false);
        setSuccess('Account created successfully! Please sign in.');
"""
content = re.sub(r"const userCred = await createUserWithEmailAndPassword\(auth, email, passcode\);\s*await setDoc\(doc\(db, 'users', userCred\.user\.uid\), \{\s*role: selectedRole,\s*label: label \|\| email,\s*email: email\s*\}\);", sign_up_logic.strip(), content)

with open('src/components.tsx', 'w') as f:
    f.write(content)

