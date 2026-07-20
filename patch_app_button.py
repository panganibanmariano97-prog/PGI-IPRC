import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

logout_button_pattern = r"(          <button \n            onClick=\{\(\) => setUser\(null\)\})"
duplicate_button = """          {duplicates.length > 0 && (
            <button
              onClick={() => setShowDuplicateModal(true)}
              className="flex items-center px-4 py-2.5 mr-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all shadow-sm border border-red-800 shrink-0"
            >
              <AlertTriangle size={14} className="mr-1.5" />
              {duplicates.length} Duplicate{duplicates.length > 1 ? 's' : ''}
            </button>
          )}
"""
code = code.replace("          <button \n            onClick={() => setUser(null)}", duplicate_button + "          <button \n            onClick={() => setUser(null)}")

return_pattern = r"(  return \(\n    <div className=\"min-h-screen bg-\[\#fdfbf7\] flex flex-col font-sans\">\n      <header className=\"bg-emerald-900 border-b-4 border-yellow-500 shadow-md z-10 relative shrink-0\">)"
modal_component = """      {showDuplicateModal && (
        <DuplicateModal 
          duplicates={duplicates} 
          onClose={() => setShowDuplicateModal(false)} 
        />
      )}
"""
code = code.replace("  return (\n    <div className=\"min-h-screen bg-[#fdfbf7] flex flex-col font-sans\">\n      <header className=\"bg-emerald-900 border-b-4 border-yellow-500 shadow-md z-10 relative shrink-0\">", 
"  return (\n    <div className=\"min-h-screen bg-[#fdfbf7] flex flex-col font-sans\">\n" + modal_component + "      <header className=\"bg-emerald-900 border-b-4 border-yellow-500 shadow-md z-10 relative shrink-0\">")


with open('src/App.tsx', 'w') as f:
    f.write(code)

