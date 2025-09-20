import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12', 
  lg: 'h-16 w-16',
  xl: 'h-20 w-20'
};

export default function Logo({ 
  size = 'md', 
  className = '', 
  showText = false,
  textClassName = 'text-white'
}: LogoProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Image
        src="/images/logo.png"
        alt="Logo"
        width={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 80}
        height={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 80}
        className={`${sizeClasses[size]} object-contain`}
        onError={(e) => {
          // Fallback if logo doesn't exist
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
      {showText && (
        <span className={`font-bold text-xl ${textClassName}`}>
          Courtside
        </span>
      )}
    </div>
  );
}
