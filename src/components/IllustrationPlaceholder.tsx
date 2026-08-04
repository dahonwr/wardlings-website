import React from 'react';

interface IllustrationPlaceholderProps {
  label: string;
  sublabel?: string;
  aspectRatio?: string; // e.g., 'aspect-[4/3]', 'aspect-[16/9]', 'aspect-square'
  heightClass?: string; // e.g. 'h-[400px]'
  className?: string;
  rounded?: string;
  variant?: 'dashed' | 'solid' | 'subtle';
}

export const IllustrationPlaceholder: React.FC<IllustrationPlaceholderProps> = ({
  label,
  sublabel = 'Illustration Placeholder',
  aspectRatio = 'aspect-[4/3]',
  heightClass = '',
  className = '',
  rounded = 'rounded-[28px]',
  variant = 'solid',
}) => {
  const borderStyle =
    variant === 'dashed'
      ? 'border-2 border-dashed border-[#ECE7DF]'
      : variant === 'subtle'
      ? 'border border-[#ECE7DF]/80'
      : 'border border-[#ECE7DF]';

  return (
    <div
      className={`w-full ${heightClass ? heightClass : aspectRatio} ${rounded} ${borderStyle} placeholder-grid-bg flex flex-col items-center justify-center p-6 transition-all duration-300 relative overflow-hidden group select-none ${className}`}
    >
      {/* Structural Corner Markers for Nintendo tech/sketch feel */}
      <div className="absolute top-4 left-4 w-2 h-2 border-t-2 border-l-2 border-[#5C544B]/30 rounded-tl-sm"></div>
      <div className="absolute top-4 right-4 w-2 h-2 border-t-2 border-r-2 border-[#5C544B]/30 rounded-tr-sm"></div>
      <div className="absolute bottom-4 left-4 w-2 h-2 border-b-2 border-l-2 border-[#5C544B]/30 rounded-bl-sm"></div>
      <div className="absolute bottom-4 right-4 w-2 h-2 border-b-2 border-r-2 border-[#5C544B]/30 rounded-br-sm"></div>

      {/* Clean Box Identifier Label */}
      <div className="bg-white/90 backdrop-blur-xs px-5 py-3 rounded-2xl border border-[#ECE7DF] shadow-xs flex flex-col items-center justify-center text-center space-y-1 max-w-[85%]">
        <span className="text-xs font-semibold tracking-wider text-[#5E7D3A] uppercase">
          {sublabel}
        </span>
        <span className="text-base sm:text-lg font-semibold text-[#2B241F] font-heading">
          {label}
        </span>
        <span className="text-[11px] text-[#5C544B] font-mono">
          Replace with final asset
        </span>
      </div>
    </div>
  );
};
