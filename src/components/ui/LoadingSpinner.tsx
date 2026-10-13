import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  label,
}) => {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 40,
  };

  const px = sizeMap[size];

  return (
    <div className={`spinner-wrapper ${className}`} role="status" aria-label={label || 'Memuat data...'}>
      <svg
        className="spinner-svg"
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="spinner-track"
          opacity="0.2"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="spinner-head"
        />
      </svg>
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );
};

export default LoadingSpinner;
