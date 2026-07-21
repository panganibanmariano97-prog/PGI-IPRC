import re

with open('src/components.tsx', 'r') as f:
    code = f.read()

old_catch = """    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {"""

new_catch = """    } catch (err) {
      if (err.code === 'auth/admin-restricted-operation') {
        setError('Sign-up is restricted by Firebase administrators. Please ask your administrator to create your account or enable public sign-ups in Firebase Console.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is not enabled in Firebase Console. Please enable it in Authentication settings.');
      } else {
        setError(err.message || 'Authentication failed. Please verify your details.');
      }
    } finally {"""

if old_catch in code:
    code = code.replace(old_catch, new_catch)
    print("Patched error handler")
else:
    print("Could not find old catch block")

with open('src/components.tsx', 'w') as f:
    f.write(code)
