import React from 'react';
import type { Report, ReportStatus } from '../../types/report';
import ReportRow from './ReportRow';
import EmptyState from '../ui/EmptyState';

interface ReportTableProps {
  reports: Report[];
  isLoading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  updatingId: string | null;
  updatingAction: ReportStatus | null;
  onOpenCreateModal: () => void;
  hasFiltersApplied: boolean;
  onResetFilters: () => void;
}

export const ReportTable: React.FC<ReportTableProps> = ({
  reports,
  isLoading,
  onApprove,
  onReject,
  updatingId,
  updatingAction,
  onOpenCreateModal,
  hasFiltersApplied,
  onResetFilters,
}) => {
  return (
    <div className="table-card">
      <div className="table-responsive">
        <table className="report-table" id="report-table">
          <thead>
            <tr>
              <th scope="col" className="th-name">
                Nama Laporan
              </th>
              <th scope="col" className="th-description">
                Deskripsi
              </th>
              <th scope="col" className="th-status">
                Status
              </th>
              <th scope="col" className="th-actions">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Skeleton loading rows
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="skeleton-row">
                  <td className="cell-name">
                    <div className="skeleton-line skeleton-title" />
                    <div className="skeleton-line skeleton-subtitle" />
                  </td>
                  <td className="cell-description">
                    <div className="skeleton-line skeleton-text" />
                    <div className="skeleton-line skeleton-text-short" />
                  </td>
                  <td className="cell-status">
                    <div className="skeleton-badge" />
                  </td>
                  <td className="cell-actions">
                    <div className="skeleton-actions" />
                  </td>
                </tr>
              ))
            ) : reports.length > 0 ? (
              reports.map((report) => (
                <ReportRow
                  key={report.id}
                  report={report}
                  onApprove={onApprove}
                  onReject={onReject}
                  isUpdating={updatingId === report.id}
                  updatingAction={updatingId === report.id ? updatingAction : null}
                />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="cell-empty">
                  {hasFiltersApplied ? (
                    <EmptyState
                      title="Tidak Ada Laporan yang Cocok"
                      description="Tidak ditemukan laporan yang sesuai dengan kriteria pencarian atau filter status yang dipilih."
                      actionText="Reset Filter"
                      onAction={onResetFilters}
                      icon={
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      }
                    />
                  ) : (
                    <EmptyState
                      title="Belum Ada Laporan Lapangan"
                      description="Daftar laporan masih kosong. Silakan buat laporan pertama Anda untuk memulai penugasan dan verifikasi."
                      actionText="Tambah Laporan Sekarang"
                      onAction={onOpenCreateModal}
                    />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span className="table-counter">
          Menampilkan <strong>{reports.length}</strong> laporan
        </span>
      </div>
    </div>
  );
};

export default ReportTable;
