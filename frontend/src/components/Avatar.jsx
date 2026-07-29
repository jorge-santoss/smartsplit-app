export default function Avatar({ name, size = 'medium', className = '' }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const sizeMap = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-10 h-10 text-sm',
    large: 'w-12 h-12 text-base',
  };

  return (
    <div className={`${sizeMap[size]} bg-[#2C2C2E] text-[#2DD4BF] rounded-full font-bold flex items-center justify-center shrink-0 ${className}`}>
      {initial}
    </div>
  );
}