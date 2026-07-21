import re

with open('src/components.tsx', 'r') as f:
    content = f.read()

content = content.replace(
'''              <button 
                type="button" 
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${!isSignUp ? 'bg-emerald-800 text-white shadow-sm' : 'text-emerald-800 hover:bg-emerald-200'}`}
              >''',
'''              <button 
                type="button" 
                onClick={() => { setIsSignUp(false); setError(''); }}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${!isSignUp ? 'bg-emerald-800 text-white shadow-sm' : 'text-emerald-800 hover:bg-emerald-200'}`}
              >'''
)

content = content.replace(
'''              <button 
                type="button" 
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${isSignUp ? 'bg-emerald-800 text-white shadow-sm' : 'text-emerald-800 hover:bg-emerald-200'}`}
              >''',
'''              <button 
                type="button" 
                onClick={() => { setIsSignUp(true); setError(''); }}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${isSignUp ? 'bg-emerald-800 text-white shadow-sm' : 'text-emerald-800 hover:bg-emerald-200'}`}
              >'''
)

with open('src/components.tsx', 'w') as f:
    f.write(content)

