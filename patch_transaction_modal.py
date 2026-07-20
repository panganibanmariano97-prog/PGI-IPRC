import re

with open('src/components.tsx', 'r') as f:
    code = f.read()

modal_code = """
export const TransactionModal = ({ isOpen, onClose, onSave, title, columns, initialData }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (key, value, type) => {
    let val = value;
    if (type === 'number') {
      val = val === '' ? '' : parseFloat(val) || 0;
    }
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-t-8 border-yellow-500 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-emerald-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-4 flex-grow">
          {columns.map(col => {
            // Computed or read-only columns shouldn't usually be editable, but let's hide them or show as read-only
            // In our system, some columns are purely computed by handleDataUpdate, some are inputs.
            // Let's just render inputs for all except readOnly.
            if (col.readOnly) return null;
            
            return (
              <div key={col.key} className="flex flex-col">
                <label className="text-xs font-bold text-emerald-700 mb-1">{col.label}</label>
                {col.type === 'select' ? (
                  <select
                    className="p-2 border border-emerald-200 rounded-lg bg-emerald-50/30 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                    value={formData[col.key] || ''}
                    onChange={(e) => handleChange(col.key, e.target.value, col.type)}
                  >
                    <option value="">Select...</option>
                    {col.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={col.type === 'number' ? 'number' : (col.type === 'date' ? 'date' : 'text')}
                    className="p-2 border border-emerald-200 rounded-lg bg-emerald-50/30 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                    value={formData[col.key] || ''}
                    onChange={(e) => handleChange(col.key, e.target.value, col.type)}
                  />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-sm font-bold text-emerald-900 bg-yellow-400 hover:bg-yellow-500 rounded-lg transition-colors flex items-center shadow-sm"
          >
            <Save size={16} className="mr-2" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
"""
code += modal_code

with open('src/components.tsx', 'w') as f:
    f.write(code)

