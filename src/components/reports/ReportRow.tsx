import React from 'react';
import type { Report, ReportStatus } from '../../types/report';
import ReportStatusBadge from './ReportStatusBadge';
import Button from '../ui/Button';

interface ReportRowProps {
  report: Report;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isUpdating: boolean;
  updatingAction?: ReportStatus | null;
}

export const ReportRow: React.FC<ReportRowProps> = ({
  report,
  onApprove,
  onReject,
  isUpdating,
  updatingAction,
}) => {
  const isApproved = report.status === 'approved';
  const isRejected = report.status === 'rejected';

  const isApproving = isUpdating && updatingAction === 'approved';
  const isRejecting = isUpdating && updatingAction === 'rejected';

  // Format date helper if available
  const dateValue = report.created_at || report.createdAt;
  const formattedDate = dateValue
    ? new Date(dateValue).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <tr className={`report-table-row status-row-${report.status}`}>
      {/* Kolom Nama */}
      <td className="cell-name">
        <div className="name-wrapper">
          <span className="report-name" title={report.name}>
            {report.name}
          </span>
          <span className="report-meta">
            <span className="report-id" title={`ID: ${report.id}`}>
              #{report.id.slice(-6)}
            </span>
            {formattedDate && (
              <>
                <span className="meta-sep">&bull;</span>
                <span className="report-date">{formattedDate}</span>
              </>
            )}
          </span>
        </div>
      </td>

      {/* Kolom Deskripsi */}
      <td className="cell-description">
        <p className="report-description" title={report.description}>
          {report.description}
        </p>
      </td>

      {/* Kolom Status */}
      <td className="cell-status">
        <ReportStatusBadge status={report.status} />
      </td>

      {/* Kolom Aksi */}
      <td className="cell-actions">
        <div className="action-buttons-group">
          {/* Tombol Approve */}
          <Button
            variant="success"
            size="sm"
            disabled={isApproved || isUpdating}
            isLoading={isApproving}
            onClick={() => onApprove(report.id)}
            title={
              isApproved
                ? 'Laporan ini sudah disetujui'
                : 'Setujui laporan ini (Approve)'
            }
            leftIcon={
              !isApproving ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : undefined
            }
          >
            {isApproved ? 'Approved' : 'Approve'}
          </Button>

          {/* Tombol Reject */}
          <Button
            variant="danger"
            size="sm"
            disabled={isRejected || isUpdating}
            isLoading={isRejecting}
            onClick={() => onReject(report.id)}
            title={
              isRejected
                ? 'Laporan ini sudah ditolak'
                : 'Tolak laporan ini (Reject)'
            }
            leftIcon={
              !isRejecting ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : undefined
            }
          >
            {isRejected ? 'Rejected' : 'Reject'}
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default ReportRow;
