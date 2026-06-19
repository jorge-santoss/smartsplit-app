export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-[#E1EEE8]">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="text-sm px-3 py-1.5 rounded-lg border border-[#E1EEE8] text-[#4A6B5D] hover:bg-[#E1EEE8] hover:text-[#154535] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`text-sm w-8 h-8 rounded-full font-medium transition-colors ${
            page === p
              ? "bg-[#154535] text-white shadow-sm"
              : "text-[#4A6B5D] hover:bg-[#E1EEE8] hover:text-[#154535]"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="text-sm px-3 py-1.5 rounded-lg border border-[#E1EEE8] text-[#4A6B5D] hover:bg-[#E1EEE8] hover:text-[#154535] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
}