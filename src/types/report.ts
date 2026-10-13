export type ReportStatus = 'pending' | 'approved' | 'rejected';

export interface Report {
  id: string;
  name: string;
  description: string;
  status: ReportStatus;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReportPayload {
  name: string;
  description: string;
}

export interface UpdateReportStatusPayload {
  status: ReportStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
