import React, { useState } from 'react';
import type { CreateReportPayload } from '../../types/report';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateReportPayload) => Promise<void>;
  isSubmitting: boolean;
}

const ReportFormModalContent: React.FC<Omit<ReportFormModalProps, 'isOpen'>> = ({
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [touched, setTouched] = useState<{ name?: boolean; description?: boolean }>({});
  const [errorText, setErrorText] = useState<string | null>(null);

  const nameError = touched.name && !name.trim() ? 'Nama laporan wajib diisi.' : null;
  const descriptionError = touched.description && !description.trim() ? 'Deskripsi laporan wajib diisi.' : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ name: true, description: true });

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName || !trimmedDescription) {
      setErrorText('Silakan lengkapi semua kolom yang wajib diisi.');
      return;
    }

    try {
      setErrorText(null);
      await onSubmit({
        name: trimmedName,
        description: trimmedDescription,
      });
      // Modal closing is controlled by parent upon successful resolution
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat laporan';
      setErrorText(msg);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Tambah Laporan Baru"
      subtitle="Laporkan temuan atau aktivitas kerja lapangan terbaru Anda"
      footer={
        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="create-report-form"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            leftIcon={
              !isSubmitting ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              ) : undefined
            }
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Laporan'}
          </Button>
        </div>
      }
    >
      <form id="create-report-form" onSubmit={handleSubmit} noValidate className="report-form">
        {errorText && (
          <div className="form-error-banner" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorText}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="report-name" className="form-label">
            Nama Laporan <span className="required-star">*</span>
          </label>
          <input
            id="report-name"
            name="name"
            type="text"
            className={`form-input ${nameError ? 'input-error' : ''}`}
            placeholder="Contoh: Inspeksi Saluran Irigasi Blok C"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errorText) setErrorText(null);
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
            disabled={isSubmitting}
            autoFocus
          />
          {nameError && <p className="field-error-msg">{nameError}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="report-description" className="form-label">
            Deskripsi Laporan <span className="required-star">*</span>
          </label>
          <textarea
            id="report-description"
            name="description"
            rows={4}
            className={`form-textarea ${descriptionError ? 'input-error' : ''}`}
            placeholder="Jelaskan temuan kondisi lapangan, lokasi spesifik, atau kendala yang dihadapi secara rinci..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errorText) setErrorText(null);
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
            disabled={isSubmitting}
          />
          {descriptionError && <p className="field-error-msg">{descriptionError}</p>}
          <span className="field-hint">
            Laporan yang baru dibuat akan otomatis berstatus <strong>Pending</strong>.
          </span>
        </div>
      </form>
    </Modal>
  );
};

export const ReportFormModal: React.FC<ReportFormModalProps> = ({
  isOpen,
  ...props
}) => {
  if (!isOpen) return null;
  return <ReportFormModalContent {...props} />;
};

export default ReportFormModal;
