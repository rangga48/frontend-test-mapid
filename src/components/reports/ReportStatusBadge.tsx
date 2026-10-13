import React from 'react';
import type { ReportStatus } from '../../types/report';

interface ReportStatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

export const ReportStatusBadge: React.FC<ReportStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const configMap: Record<
    ReportStatus,
    { label: string; bgClass: string; icon: React.ReactNode }
  > = {
    pending: {
      label: 'Pending',
      bgClass: 'badge-pending',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    approved: {
      label: 'Approved',
      bgClass: 'badge-approved',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ),
    },
    rejected: {
      label: 'Rejected',
      bgClass: 'badge-rejected',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
  };

  const current = configMap[status] || {
    label: status,
    bgClass: 'badge-pending',
    icon: null,
  };

  return (
    <span className={`status-badge ${current.bgClass} ${className}`}>
      <span className="badge-icon">{current.icon}</span>
      <span className="badge-text">{current.label}</span>
    </span>
  );
};

export default ReportStatusBadge;
