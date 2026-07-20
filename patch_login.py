with open('src/components.tsx', 'r') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if line.startswith("export const Login ="):
        start_idx = i
    if line.startswith("export const FilterToolbar ="):
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    new_login = """import { auth, db } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [label, setLabel] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isSignUp) {
        if (adminPasscode !== 'AccountingSignUpPPP') {
           setError('Invalid Registration Passcode.');
           setLoading(false);
           return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, passcode);
        await setDoc(doc(db, 'users', userCred.user.uid), {
          role: selectedRole,
          label: label || email,
          email: email
        });
      } else {
        await signInWithEmailAndPassword(auth, email, passcode);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-[#fdfbf7] p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-8 border-yellow-500 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg border-2 border-yellow-500 overflow-hidden">
            <Wheat className="w-full h-full text-yellow-600 p-4" />
          </div>
          <h1 className="text-2xl font-black text-emerald-900 text-center tracking-wide">Isabela Rice Processing Complex</h1>
          <p className="text-amber-800 font-bold text-xs uppercase tracking-wider mt-1">Inventory Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex justify-center mb-2">
            <div className="bg-emerald-100 p-1 rounded-lg inline-flex">
              <button 
                type="button" 
                onClick={() => { setIsSignUp(false); setError(''); }}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${!isSignUp ? 'bg-emerald-800 text-white shadow-sm' : 'text-emerald-800 hover:bg-emerald-200'}`}
              >
                Sign In
              </button>
              <button 
                type="button" 
                onClick={() => { setIsSignUp(true); setError(''); }}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${isSignUp ? 'bg-emerald-800 text-white shadow-sm' : 'text-emerald-800 hover:bg-emerald-200'}`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-emerald-900 mb-1.5">Select Account Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircle className="h-5 w-5 text-emerald-700" />
                </div>
                <select
                  value={selectedRole}
                  onChange={(e) => { setSelectedRole(e.target.value); setError(''); }}
                  className="block w-full pl-10 pr-3 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-emerald-950 font-bold appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>-- Select Assigned Role --</option>
                  <option value={ROLES.ACCOUNTING}>Administrator / Accounting</option>
                  <option value={ROLES.PURCHASE}>Purchasing Department</option>
                  <option value={ROLES.PRODUCTION}>Production Department</option>
                  <option value={ROLES.OBSERVER}>Observer (View Only)</option>
                </select>
              </div>
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-emerald-900 mb-1.5">Full Name / Label</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircle className="h-5 w-5 text-emerald-700 opacity-50" />
                </div>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => { setLabel(e.target.value); setError(''); }}
                  className="block w-full pl-10 pr-3 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-emerald-950 placeholder-emerald-300 transition-all font-mono"
                  placeholder="Enter Name"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-emerald-900 mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCircle className="h-5 w-5 text-emerald-700 opacity-50" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="block w-full pl-10 pr-3 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-emerald-950 placeholder-emerald-300 transition-all font-mono"
                placeholder="Enter Email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-emerald-900 mb-1.5">{isSignUp ? 'Create Passcode' : 'Access Passcode'}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-emerald-700" />
              </div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => { setPasscode(e.target.value); setError(''); }}
                className="block w-full pl-10 pr-3 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-emerald-950 placeholder-emerald-300 transition-all font-mono"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-emerald-900 mb-1.5">Registration Passcode</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-emerald-700" />
                </div>
                <input
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => { setAdminPasscode(e.target.value); setError(''); }}
                  className="block w-full pl-10 pr-3 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-emerald-950 placeholder-emerald-300 transition-all font-mono"
                  placeholder="Required for Sign Up"
                  required
                />
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-xs text-red-700 font-medium animate-pulse">
              <AlertCircle className="shrink-0 mr-2" size={14} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center mt-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-black uppercase tracking-wider text-emerald-950 bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Authenticate')}
          </button>
        </form>
      </div>
    </div>
  );
};

"""
    lines[start_idx:end_idx] = [new_login]

with open('src/components.tsx', 'w') as f:
    f.writelines(lines)

print("components.tsx patched!")
