import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { exportHousehold } from '../api/exportApi';

export default function ExportButton({ householdId }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleExport = async (format) => {
    setOpen(false);
    setLoading(true);
    try {
      await exportHousehold(householdId, format);
      toast(`${format.toUpperCase()} downloaded successfully`);
    } catch {
      toast(`Failed to export ${format.toUpperCase()}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </>
        )}
      </button>

      {open && (
        <>
          {/* Click outside to close */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-45">
            <button
              onClick={() => handleExport('csv')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="text-base">📄</span>
              Download CSV
            </button>
            <div className="border-t border-gray-100" />
            <button
              onClick={() => handleExport('pdf')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="text-base">📑</span>
              Download PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
