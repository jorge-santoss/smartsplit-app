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
        className="flex items-center gap-2 bg-white border border-[#E1EEE8] text-[#4A6B5D] hover:bg-[#154535] hover:text-[#ffffff] text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-[#E1EEE8] border-t-[#154535] rounded-full animate-spin" />
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
          <div className="absolute right-0 mt-1 z-50 bg-white border border-[#E1EEE8] rounded-lg shadow-[0_4px_12px_-4px_rgba(21,69,53,0.08)] overflow-hidden w-45">
            <button
              onClick={() => handleExport('csv')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#4A6B5D] hover:bg-[#E1EEE8] hover:text-[#154535] transition-colors"
            >
              <span className="text-base">📄</span>
              Download CSV
            </button>
            <div className="border-t border-[#E1EEE8]" />
            <button
              onClick={() => handleExport('pdf')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#4A6B5D] hover:bg-[#E1EEE8] hover:text-[#154535] transition-colors"
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