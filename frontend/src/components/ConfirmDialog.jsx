export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121214]/60 backdrop-blur-sm">
      <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-2xl shadow-black/60 rounded-2xl p-6 max-w-sm w-full mx-4">
        {title && <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>}
        <p className="text-[#9CA3AF] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-[#2C2C2E] bg-[#121214] text-[#9CA3AF] hover:bg-[#2C2C2E] hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-lg bg-[#FB7185] text-white hover:brightness-110 transition-all shadow-lg shadow-rose-400/25"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}