interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        
        {/* Outer circle */}
        <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" />
        
        {/* Inner design - stylized "A" */}
        <path 
          d="M30 70 L50 25 L70 70 M35 60 L65 60" 
          stroke="white" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Connection dots */}
        <circle cx="35" cy="40" r="2" fill="white" opacity="0.8" />
        <circle cx="65" cy="40" r="2" fill="white" opacity="0.8" />
        <circle cx="50" cy="75" r="2" fill="white" opacity="0.8" />
      </svg>
    </div>
  );
}