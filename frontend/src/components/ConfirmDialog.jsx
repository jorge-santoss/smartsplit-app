export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-[0_8px_24px_-8px_rgba(21,69,53,0.15)] border border-white/80 p-6 max-w-sm w-full mx-4">
        {title && <h3 className="text-lg font-semibold text-[#154535] mb-2">{title}</h3>}
        <p className="text-[#4A6B5D] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-[#E1EEE8] bg-[#F8FCFA] text-[#4A6B5D] hover:bg-[#E1EEE8] hover:text-[#154535] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-lg bg-[#D94A4A] text-white hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}