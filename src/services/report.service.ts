import api, { ApiError } from './api';
import type {
  Report,
  ReportStatus,
  CreateReportPayload,
  UpdateReportStatusPayload,
  ApiResponse,
} from '../types/report';

// Mock initial data if demo mode is active or backend is unreachable
// Mock initial data matching backend Express response format
const INITIAL_DEMO_REPORTS: Report[] = [
  {
    id: 'e4c76b9a-4e89-4d23-93ab-f875b2b2b111',
    name: 'Pemeriksaan Area A',
    description: 'Ditemukan kerusakan pada pagar.',
    status: 'pending',
    created_at: '2026-10-13T15:30:00.000Z',
    updated_at: '2026-10-13T15:30:00.000Z',
    createdAt: '2026-10-13T15:30:00.000Z',
    updatedAt: '2026-10-13T15:30:00.000Z',
  },
  {
    id: 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Pemeriksaan Saluran Air',
    description: 'Pipa saluran air tersumbat di sektor B.',
    status: 'approved',
    created_at: '2026-10-13T14:10:00.000Z',
    updated_at: '2026-10-13T14:25:00.000Z',
    createdAt: '2026-10-13T14:10:00.000Z',
    updatedAt: '2026-10-13T14:25:00.000Z',
  },
  {
    id: 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
    name: 'Audit Kualitas Tanah dan Vegetasi',
    description: 'Sampel tanah tidak memenuhi standar kelembapan minimum.',
    status: 'rejected',
    created_at: '2026-10-13T12:00:00.000Z',
    updated_at: '2026-10-13T12:30:00.000Z',
    createdAt: '2026-10-13T12:00:00.000Z',
    updatedAt: '2026-10-13T12:30:00.000Z',
  },
];

const LOCAL_STORAGE_KEY = 'mapid_demo_reports';
const DEMO_MODE_KEY = 'mapid_demo_mode_enabled';

const getStoredMockReports = (): Report[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Report[];
    }
  } catch {
    // fallback if parse fails
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_REPORTS));
  return INITIAL_DEMO_REPORTS;
};

const saveStoredMockReports = (reports: Report[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
  } catch {
    // ignore storage write errors
  }
};

export const isDemoModeActive = (): boolean => {
  return localStorage.getItem(DEMO_MODE_KEY) === 'true';
};

export const setDemoModeActive = (active: boolean): void => {
  localStorage.setItem(DEMO_MODE_KEY, active ? 'true' : 'false');
};

/**
 * Normalizes backend response to standard Report format
 */
const normalizeReport = (raw: Record<string, unknown>): Report => {
  const createdAt = String(raw.created_at || raw.createdAt || new Date().toISOString());
  const updatedAt = String(raw.updated_at || raw.updatedAt || new Date().toISOString());

  return {
    id: String(raw.id || raw._id || `rep-${Date.now()}`),
    name: String(raw.name || ''),
    description: String(raw.description || ''),
    status: (raw.status as ReportStatus) || 'pending',
    created_at: createdAt,
    updated_at: updatedAt,
    createdAt,
    updatedAt,
  };
};

export const reportService = {
  /**
   * FR-01: Memuat daftar laporan
   * GET /reports
   */
  async getReports(): Promise<{ reports: Report[]; isMock: boolean }> {
    if (isDemoModeActive()) {
      return { reports: getStoredMockReports(), isMock: true };
    }

    try {
      const response = await api.get<ApiResponse<Report[]> | Report[] | { data: Report[] }>('/reports');
      let rawList: unknown[] = [];

      if (Array.isArray(response.data)) {
        rawList = response.data;
      } else if (response.data && typeof response.data === 'object') {
        const payload = response.data as { data?: unknown[] };
        if (Array.isArray(payload.data)) {
          rawList = payload.data;
        }
      }

      const normalized = rawList.map((item) => normalizeReport(item as Record<string, unknown>));
      return { reports: normalized, isMock: false };
    } catch (err) {
      // If network fails (e.g. backend server not started), re-throw so UI can handle it or prompt for demo mode
      if (err instanceof ApiError && err.status === 0) {
        throw new ApiError(
          err.message || 'Tidak dapat terhubung ke server backend',
          0,
          'Network Error',
          { isConnectionRefused: true }
        );
      }
      throw err;
    }
  },

  /**
   * FR-02: Membuat laporan baru
   * POST /reports
   */
  async createReport(payload: CreateReportPayload): Promise<{ report: Report; isMock: boolean }> {
    if (isDemoModeActive()) {
      const mockList = getStoredMockReports();
      const newReport: Report = {
        id: `rep-${Date.now().toString(36)}`,
        name: payload.name.trim(),
        description: payload.description.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedList = [newReport, ...mockList];
      saveStoredMockReports(updatedList);
      return { report: newReport, isMock: true };
    }

    const response = await api.post<ApiResponse<Report> | Report | { data: Report }>('/reports', {
      name: payload.name.trim(),
      description: payload.description.trim(),
    });

    let rawReport: unknown = response.data;
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      rawReport = (response.data as { data: unknown }).data;
    }

    return {
      report: normalizeReport(rawReport as Record<string, unknown>),
      isMock: false,
    };
  },

  /**
   * FR-03 & FR-04: Memperbarui status laporan (approve / reject)
   * PATCH /reports/:id/status
   */
  async updateReportStatus(id: string, status: ReportStatus): Promise<{ report: Report; isMock: boolean }> {
    if (isDemoModeActive()) {
      const mockList = getStoredMockReports();
      let updatedReport: Report | null = null;
      const updatedList = mockList.map((rep) => {
        if (rep.id === id) {
          updatedReport = {
            ...rep,
            status,
            updatedAt: new Date().toISOString(),
          };
          return updatedReport;
        }
        return rep;
      });

      if (!updatedReport) {
        throw new ApiError(`Laporan dengan ID ${id} tidak ditemukan`, 404, 'Not Found');
      }

      saveStoredMockReports(updatedList);
      return { report: updatedReport, isMock: true };
    }

    const payload: UpdateReportStatusPayload = { status };
    const response = await api.patch<ApiResponse<Report> | Report | { data: Report }>(
      `/reports/${id}/status`,
      payload
    );

    let rawReport: unknown = response.data;
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      rawReport = (response.data as { data: unknown }).data;
    }

    // In case the backend returns empty or partial data, ensure status is reflected
    const normalized = normalizeReport((rawReport as Record<string, unknown>) || { id, status });
    normalized.status = status;

    return {
      report: normalized,
      isMock: false,
    };
  },

  /**
   * Reset demo data helper
   */
  resetDemoData(): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_REPORTS));
  },
};

export default reportService;
