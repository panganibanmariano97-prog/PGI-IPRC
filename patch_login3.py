import re

with open('src/components.tsx', 'r') as f:
    content = f.read()

# Remove the auth.signOut() and success state changes after sign up
sign_up_logic_old = """
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
sign_up_logic_new = """
        const userCred = await createUserWithEmailAndPassword(auth, email, passcode);
        await setDoc(doc(db, 'users', userCred.user.uid), {
          role: selectedRole,
          label: label || email,
          email: email
        });
"""
content = content.replace(sign_up_logic_old.strip(), sign_up_logic_new.strip())

with open('src/components.tsx', 'w') as f:
    f.write(content)

