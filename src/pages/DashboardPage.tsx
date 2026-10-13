import React, { useState, useEffect, useMemo, useCallback } from "react";
import type {
  Report,
  ReportStatus,
  CreateReportPayload,
} from "../types/report";
import reportService from "../services/report.service";
import { ApiError } from "../services/api";
import { useToast } from "../components/ui/Toast";
import Header from "../components/layout/Header";
import StatsCard from "../components/ui/StatsCard";
import ReportTable from "../components/reports/ReportTable";
import ReportFormModal from "../components/reports/ReportFormModal";
import Button from "../components/ui/Button";

const getErrorMessage = (err: unknown): string => {
  const isConnectionError =
    err instanceof ApiError &&
    (err.status === 0 ||
      (err.data as { isConnectionRefused?: boolean })?.isConnectionRefused);

  return isConnectionError
    ? "Gagal terhubung ke server backend. Pastikan server telah aktif lalu klik Coba Lagi."
    : err instanceof Error
      ? err.message
      : "Terjadi kesalahan saat memuat data laporan";
};

export const DashboardPage: React.FC = () => {
  const { success, error } = useToast();

  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updatingAction, setUpdatingAction] = useState<ReportStatus | null>(
    null,
  );

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReportStatus>("all");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await reportService.getReports();
      setReports(result.reports);
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      // FR-05 & Rule: Tampilkan pesan error dan jangan menghapus data yang sedang ditampilkan
      setErrorMessage(message);
      error(message, "Gagal Memuat Laporan");
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    let ignore = false;

    reportService
      .getReports()
      .then((result) => {
        if (!ignore) {
          setReports(result.reports);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const message = getErrorMessage(err);
          setErrorMessage(message);
          error(message, "Gagal Memuat Laporan");
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [error]);

  const handleCreateReport = async (payload: CreateReportPayload) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await reportService.createReport(payload);

      // Update local state by placing new report at top
      setReports((prev) => [result.report, ...prev]);
      setIsModalOpen(false);
      success(
        `Laporan "${result.report.name}" berhasil dibuat dengan status Pending.`,
        "Laporan Ditambahkan",
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat laporan";
      error(msg, "Gagal Menyimpan");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, targetStatus: ReportStatus) => {
    setUpdatingId(id);
    setUpdatingAction(targetStatus);
    setErrorMessage(null);

    try {
      const result = await reportService.updateReportStatus(id, targetStatus);

      setReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: result.report.status,
                updatedAt: result.report.updatedAt,
              }
            : r,
        ),
      );

      const statusLabel =
        targetStatus === "approved"
          ? "Approved (Disetujui)"
          : "Rejected (Ditolak)";
      success(
        `Laporan #${id.slice(-6)} berhasil diubah menjadi ${statusLabel}.`,
        "Status Diperbarui",
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal memperbarui status laporan";
      error(msg, "Gagal Memperbarui");
    } finally {
      setUpdatingId(null);
      setUpdatingAction(null);
    }
  };

  /**
   * Metric counts
   */
  const metrics = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) => r.status === "pending").length;
    const approved = reports.filter((r) => r.status === "approved").length;
    const rejected = reports.filter((r) => r.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [reports]);

  /**
   * Filtered & Searched Reports
   */
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // Status filter
      if (statusFilter !== "all" && report.status !== statusFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = report.name.toLowerCase().includes(query);
        const matchDesc = report.description.toLowerCase().includes(query);
        const matchId = report.id.toLowerCase().includes(query);
        return matchName || matchDesc || matchId;
      }

      return true;
    });
  }, [reports, statusFilter, searchQuery]);

  const hasFiltersApplied =
    statusFilter !== "all" || searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="dashboard-layout">
      {/* App Header */}
      <Header onOpenCreateModal={() => setIsModalOpen(true)} />

      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Connection / Error Banner */}
          {errorMessage && (
            <div className="error-alert-banner" role="alert">
              <div className="error-alert-content">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="error-alert-icon"
                >
                  <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="error-alert-text">
                  <strong className="error-alert-title">
                    Koneksi Server Terkendala
                  </strong>
                  <p>{errorMessage}</p>
                </div>
              </div>
              <div className="error-alert-actions">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fetchReports()}
                >
                  Coba Lagi
                </Button>
              </div>
            </div>
          )}

          {/* Stats Summary Cards */}
          <section
            className="stats-section"
            aria-label="Ringkasan Statistik Laporan"
          >
            <StatsCard
              title="Total Laporan"
              count={metrics.total}
              variant="total"
              isActive={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              }
            />
            <StatsCard
              title="Menunggu (Pending)"
              count={metrics.pending}
              variant="pending"
              isActive={statusFilter === "pending"}
              onClick={() =>
                setStatusFilter(statusFilter === "pending" ? "all" : "pending")
              }
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
            />
            <StatsCard
              title="Disetujui (Approved)"
              count={metrics.approved}
              variant="approved"
              isActive={statusFilter === "approved"}
              onClick={() =>
                setStatusFilter(
                  statusFilter === "approved" ? "all" : "approved",
                )
              }
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              }
            />
            <StatsCard
              title="Ditolak (Rejected)"
              count={metrics.rejected}
              variant="rejected"
              isActive={statusFilter === "rejected"}
              onClick={() =>
                setStatusFilter(
                  statusFilter === "rejected" ? "all" : "rejected",
                )
              }
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              }
            />
          </section>

          {/* Table Controls & Filter Toolbar */}
          <section className="toolbar-section">
            <div className="toolbar-search">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="search-icon"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Cari laporan berdasarkan nama atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchQuery("")}
                  aria-label="Bersihkan pencarian"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="toolbar-filters">
              <div className="filter-group">
                <span className="filter-label">Status:</span>
                <div className="status-pill-list">
                  <button
                    type="button"
                    className={`pill-btn ${statusFilter === "all" ? "pill-active" : ""}`}
                    onClick={() => setStatusFilter("all")}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    className={`pill-btn ${statusFilter === "pending" ? "pill-active" : ""}`}
                    onClick={() => setStatusFilter("pending")}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    className={`pill-btn ${statusFilter === "approved" ? "pill-active" : ""}`}
                    onClick={() => setStatusFilter("approved")}
                  >
                    Approved
                  </button>
                  <button
                    type="button"
                    className={`pill-btn ${statusFilter === "rejected" ? "pill-active" : ""}`}
                    onClick={() => setStatusFilter("rejected")}
                  >
                    Rejected
                  </button>
                </div>
              </div>

              {hasFiltersApplied && (
                <button
                  type="button"
                  className="reset-filters-btn"
                  onClick={handleResetFilters}
                >
                  Reset
                </button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchReports()}
                title="Muat ulang data dari API"
                leftIcon={
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                }
              >
                Refresh
              </Button>
            </div>
          </section>

          {/* Main Reports Table */}
          <section className="table-section">
            <ReportTable
              reports={filteredReports}
              isLoading={isLoading}
              onApprove={(id) => handleUpdateStatus(id, "approved")}
              onReject={(id) => handleUpdateStatus(id, "rejected")}
              updatingId={updatingId}
              updatingAction={updatingAction}
              onOpenCreateModal={() => setIsModalOpen(true)}
              hasFiltersApplied={hasFiltersApplied}
              onResetFilters={handleResetFilters}
            />
          </section>
        </div>
      </main>

      {/* Create Report Modal */}
      <ReportFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateReport}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default DashboardPage;
