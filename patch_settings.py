with open('src/components.tsx', 'r') as f:
    code = f.read()

# I will find the User Account Management block and remove it.
start_str = """        <div className="pt-4 border-t border-amber-100">
            <div className="flex justify-between items-center mb-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center">
                      <UserCircle className="mr-1.5 text-yellow-600" size={16} />
                      User Account Management
                  </label>
                  <p className="text-[11px] text-amber-700 font-semibold mt-0.5">Manage usernames, passcodes, and assigned roles.</p>
                </div>
                <button type="button" onClick={addAccount} className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm transition-all active:scale-95">
                    <Plus size={14} className="mr-1" /> Add Account
                </button>
            </div>"""

end_str = """                </div>
            </div>
        </div>

        <div className="pt-4 border-t border-amber-100">
            <label className="block text-xs font-bold text-emerald-900 mb-2 uppercase tracking-wide flex items-center">"""

import re

# We can use regex to remove everything from start_str to end_str
pattern = re.escape(start_str) + r".*?" + re.escape("""        <div className="pt-4 border-t border-amber-100">
            <label className="block text-xs font-bold text-emerald-900 mb-2 uppercase tracking-wide flex items-center">""")

new_code = re.sub(pattern, """        <div className="pt-4 border-t border-amber-100">
            <label className="block text-xs font-bold text-emerald-900 mb-2 uppercase tracking-wide flex items-center">""", code, flags=re.DOTALL)

with open('src/components.tsx', 'w') as f:
    f.write(new_code)
