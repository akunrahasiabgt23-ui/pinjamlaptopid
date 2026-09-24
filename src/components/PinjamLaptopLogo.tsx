import React from 'react';

interface PinjamLaptopLogoProps {
  variant?: 'horizontal' | 'vertical' | 'icon-only' | 'compact';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
  inverted?: boolean;
}

export const PinjamLaptopLogo: React.FC<PinjamLaptopLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showSubtitle = true,
  inverted = false
}) => {
  // Dimension scale based on size prop
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  }[size];

  // Stylized "P" icon as high-fidelity SVG matching exactly the user's uploaded logo mark
  const LogoMark = (
    <div className={`relative flex-shrink-0 flex items-center justify-center ${iconDimensions}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-sm transition-transform group-hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Vibrant Cyan to Royal Blue Gradient */}
          <linearGradient id="userLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00baf2" />
            <stop offset="28%" stopColor="#008be3" />
            <stop offset="68%" stopColor="#005ec9" />
            <stop offset="100%" stopColor="#0041a8" />
          </linearGradient>

          {/* Inner 3D Floor Shadow Facet */}
          <linearGradient id="userLogoFacet" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#002b66" />
            <stop offset="60%" stopColor="#003d85" />
            <stop offset="100%" stopColor="#00224d" />
          </linearGradient>

          {/* Lower Spur Gradient */}
          <linearGradient id="userLogoSpur" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#007fda" />
            <stop offset="100%" stopColor="#0044ae" />
          </linearGradient>

          {/* Subtle glossy top highlight */}
          <linearGradient id="userLogoHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Main Upper Loop & Left Spear Wing */}
        <path
          d="M 28 8 
             L 76 9 
             C 86 9 93 14 96 22 
             C 98.5 28 98 36 94 44 
             C 89 53 82 58 72 58 
             L 46 58 
             L 1 60 
             L 37 49 
             L 45 49 
             L 70 49 
             C 76 49 80 43 81 37 
             C 82 30 78 22 70 22 
             L 44 22 
             L 36 49 
             L 28 8 
             Z"
          fill="url(#userLogoGrad)"
        />

        {/* 2. Inner 3D Floor Facet for Depth */}
        <path
          d="M 36 49 
             L 70 49 
             C 77 49 81 44 81 37 
             L 48 37 
             Z"
          fill="url(#userLogoFacet)"
          opacity="0.9"
        />

        {/* 3. Lower Southwestern Triangle Spur */}
        <path
          d="M 22 65 
             L 48 65 
             L 17 92 
             Z"
          fill="url(#userLogoSpur)"
        />

        {/* 4. Specular Highlight on Top Edge */}
        <path
          d="M 28 8 L 76 9 C 84 9 90 12 94 18"
          stroke="url(#userLogoHighlight)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );

  if (variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {LogoMark}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        {LogoMark}
        <div className="flex items-baseline">
          <span className={`font-black text-lg tracking-tight ${inverted ? 'text-white' : 'text-slate-900'}`}>
            PinjamLaptop
          </span>
          <span className={`font-bold text-lg tracking-tight ${inverted ? 'text-blue-200' : 'text-sky-600'}`}>
            .ID
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {LogoMark}
        <div className="mt-2.5">
          <div className="flex items-baseline justify-center tracking-tight">
            <span className={`font-black ${size === 'lg' || size === 'xl' ? 'text-2xl' : 'text-xl'} ${inverted ? 'text-white' : 'text-slate-900'}`}>
              PinjamLaptop
            </span>
            <span className={`font-bold ${size === 'lg' || size === 'xl' ? 'text-2xl' : 'text-xl'} ${inverted ? 'text-blue-200' : 'text-sky-600'}`}>
              .ID
            </span>
          </div>
          {showSubtitle && (
            <p className={`text-[10px] sm:text-xs font-bold tracking-wider mt-0.5 ${inverted ? 'text-blue-200' : 'text-sky-600'}`}>
              0877-2596-4455 | JL. TAMAN BOROBUDUR INDAH B-20
            </p>
          )}
        </div>
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {LogoMark}
      <div className="flex flex-col text-left">
        <div className="flex items-baseline leading-none">
          <span className={`font-extrabold text-xl sm:text-2xl tracking-tight ${inverted ? 'text-white' : 'text-slate-900'}`}>
            PinjamLaptop
          </span>
          <span className={`font-bold text-xl sm:text-2xl tracking-tight ${inverted ? 'text-blue-200' : 'text-sky-600'}`}>
            .ID
          </span>
        </div>
        {showSubtitle && (
          <p className={`text-[10px] sm:text-xs font-bold tracking-wider mt-1 leading-none ${inverted ? 'text-sky-200' : 'text-sky-600'}`}>
            0877-2596-4455 | JL. TAMAN BOROBUDUR INDAH B-20
          </p>
        )}
      </div>
    </div>
  );
};
