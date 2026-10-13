import React from "react";
import Button from "../ui/Button";

interface HeaderProps {
  onOpenCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateModal }) => {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand">
          <div className="brand-texts">
            <div className="brand-title-wrap">
              <h1 className="brand-title">Field Report Management</h1>
            </div>
            <p className="brand-subtitle">
              Sistem Pemantauan dan Validasi Laporan Lapangan
            </p>
          </div>
        </div>

        <div className="header-actions">
          {/* Blue Add Report Button */}
          <Button
            variant="primary"
            size="md"
            onClick={onOpenCreateModal}
            leftIcon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          >
            Tambah Laporan
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
