// 

export default function Avatar({ name, size = 'md', className = '' }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div className={`${sizeMap[size]} rounded-full font-bold flex items-center justify-center shrink-0 ${className}`}>
      {initial}
    </div>
  );
}