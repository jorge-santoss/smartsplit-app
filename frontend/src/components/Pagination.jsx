export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-[#2C2C2E]">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="text-sm px-3 py-1.5 rounded-lg border border-[#2C2C2E] text-[#9CA3AF] hover:bg-[#2C2C2E] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`text-sm w-8 h-8 rounded-full font-medium transition-all ${
            page === p
              ? "bg-[#2DD4BF] text-[#121214] shadow-lg shadow-teal-400/25"
              : "text-[#9CA3AF] hover:bg-[#2C2C2E] hover:text-white"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="text-sm px-3 py-1.5 rounded-lg border border-[#2C2C2E] text-[#9CA3AF] hover:bg-[#2C2C2E] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Next
      </button>
    </div>
  );
}