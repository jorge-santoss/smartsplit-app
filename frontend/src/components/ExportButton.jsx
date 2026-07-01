import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { exportHousehold } from '../api/exportApi';
import { Download, ChevronDown } from "lucide-react";

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
        className="flex items-center gap-2 backdrop-blur-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 transition-all shadow-lg"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/10 border-t-[#FCEA3C] rounded-full animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Export
            <ChevronDown className="w-5 h-5" />
          </>
        )}
      </button>

      {open && (
        <>
          {/* Click outside to close */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 z-50 backdrop-blur-xl bg-[#121212]/90 border border-white/10 rounded-lg shadow-2xl overflow-hidden w-45">
            <button
              onClick={() => handleExport('csv')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-white/10 hover:text-[#FCEA3C] transition-all"
            >
              <span className="text-base">📄</span>
              Download CSV
            </button>
            <div className="border-t border-white/10" />
            <button
              onClick={() => handleExport('pdf')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-white/10 hover:text-[#FCEA3C] transition-all"
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