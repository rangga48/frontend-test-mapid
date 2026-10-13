import React from 'react';

interface StatsCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  variant: 'total' | 'pending' | 'approved' | 'rejected';
  isActive?: boolean;
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  count,
  icon,
  variant,
  isActive = false,
  onClick,
}) => {
  return (
    <div
      className={`stats-card stats-card-${variant} ${isActive ? 'stats-card-active' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="stats-card-header">
        <span className="stats-card-title">{title}</span>
        <div className="stats-card-icon">{icon}</div>
      </div>
      <div className="stats-card-body">
        <span className="stats-card-count">{count}</span>
      </div>
    </div>
  );
};

export default StatsCard;
