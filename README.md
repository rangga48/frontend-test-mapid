# Field Report Management — MAPID Case Study

Frontend web application modern untuk melihat, memantau, dan mengelola laporan lapangan secara real-time. Aplikasi ini dibangun dengan **React**, **TypeScript**, **Vite**, dan arsitektur modular yang terhubung langsung ke backend REST API Express.js.

---

## 🌟 Fitur Utama

- **FR-01 — View Reports**: Memuat dan menampilkan daftar laporan lapangan dalam tabel responsif dengan kolom *Nama Laporan*, *Deskripsi*, *Status*, dan *Aksi*.
- **FR-02 — Add Report**: Modal interaktif untuk membuat laporan baru dengan validasi form (Nama & Deskripsi wajib diisi). Laporan baru otomatis berstatus `pending`.
- **FR-03 — Approve Report**: Mengubah status laporan menjadi `approved` via API `PATCH /reports/:id/status`.
- **FR-04 — Reject Report**: Mengubah status laporan menjadi `rejected` via API `PATCH /reports/:id/status`.
- **FR-05 — Feedback & States**: Loading skeleton rows, toast notifications (sukses & gagal), non-destructive error handling, serta empty state jika belum ada data.
- **Fitur Tambahan (Opsional)**:
  - 📊 **Metrik Ringkasan**: Kartu ringkasan total laporan, pending, approved, dan rejected yang interaktif.
  - 🔍 **Pencarian Real-Time**: Cari laporan berdasarkan nama atau isi deskripsi.
  - 🏷️ **Filter Status**: Filter cepat berdasarkan status (*Semua*, *Pending*, *Approved*, *Rejected*).
  - 🔄 **Demo / Offline Mode**: Fallback otomatis & toggle mode demo jika server backend belum dijalankan, sehingga seluruh fungsionalitas tetap dapat dicoba secara instan.

---

## 🛠️ Technology Stack

| Komponen | Teknologi |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool & Bundler** | [Vite](https://vite.dev/) |
| **HTTP Client** | Axios-compatible Client (Native Fetch API wrapper) |
| **Styling** | Modern Vanilla CSS Design System (Custom Tokens, Glassmorphism, Dark Slate Theme) |
| **Typography** | Plus Jakarta Sans & JetBrains Mono (Google Fonts) |

---

## 📁 Struktur Direktori

```text
frontend-test-mapid/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx           # Brand header, status backend, tombol tambah
│   │   │   └── Footer.tsx           # Informasi lisensi & teknologi
│   │   ├── reports/
│   │   │   ├── ReportTable.tsx      # Tabel laporan utama & skeleton loader
│   │   │   ├── ReportRow.tsx        # Baris laporan, status & aksi Approve/Reject
│   │   │   ├── ReportFormModal.tsx  # Modal form tambah laporan baru
│   │   │   └── ReportStatusBadge.tsx# Badge status (pending, approved, rejected)
│   │   └── ui/
│   │       ├── Button.tsx           # Komponen tombol dengan loading & varian
│   │       ├── Modal.tsx            # Komponen modal dialog accessible
│   │       ├── Toast.tsx            # Toast notification context & provider
│   │       ├── LoadingSpinner.tsx   # SVG spinner animasi
│   │       ├── EmptyState.tsx       # Ilustrasi state kosong
│   │       └── StatsCard.tsx        # Kartu statistik laporan
│   ├── pages/
│   │   └── DashboardPage.tsx        # Halaman utama dashboard & state manager
│   ├── services/
│   │   ├── api.ts                   # Axios-compatible HTTP client
│   │   └── report.service.ts        # Service API laporan (GET, POST, PATCH)
│   ├── types/
│   │   └── report.ts                # TypeScript interfaces & types
│   ├── App.tsx                      # Root application & Toast Provider
│   ├── main.tsx                     # Entry point Vite React
│   └── index.css                    # Design system tokens & styling
├── .env                             # Environment variables lokal
├── .env.example                     # Contoh konfigurasi env
├── index.html                       # HTML5 template dengan typography
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Cara Menjalankan Proyek

### 1. Prasyarat
- **Node.js**: versi 18 atau lebih baru
- **npm** / **yarn** / **pnpm**

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Salin berkas `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi URL backend REST API Express.js:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4. Menjalankan Server Development
```bash
npm run dev
```
Buka browser pada alamat yang ditampilkan di terminal (biasanya `http://localhost:5173`).

### 5. Build untuk Produksi
```bash
npm run build
```

---

## 📡 Kontrak Integrasi API

Base URL diambil dari `VITE_API_BASE_URL` (default: `http://localhost:3000/api`).

### 1. Memuat Daftar Laporan
- **Method**: `GET`
- **Endpoint**: `/reports`
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "rep-001",
      "name": "Inspeksi Pipa Sektor A",
      "description": "Ditemukan kebocoran minor pada sambungan katup 4B.",
      "status": "pending",
      "createdAt": "2026-10-13T10:00:00.000Z"
    }
  ]
}
```

### 2. Membuat Laporan Baru
- **Method**: `POST`
- **Endpoint**: `/reports`
- **Request Body**:
```json
{
  "name": "Pemetaan Patok Batas Wilayah",
  "description": "Survei koordinat GPS patok batas selesai dilakukan dengan akurasi sub-meter."
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "rep-002",
    "name": "Pemetaan Patok Batas Wilayah",
    "description": "Survei koordinat GPS patok batas selesai dilakukan dengan akurasi sub-meter.",
    "status": "pending",
    "createdAt": "2026-10-13T12:00:00.000Z"
  }
}
```

### 3. Mengubah Status Laporan (Approve / Reject)
- **Method**: `PATCH`
- **Endpoint**: `/reports/:id/status`
- **Request Body**:
```json
{
  "status": "approved" // atau "rejected"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "rep-002",
    "status": "approved"
  }
}
```

---

## 🧪 Validasi & Perilaku Interaksi

1. **Validasi Input**:
   - Field `name` dan `description` wajib diisi saat membuat laporan.
   - Tombol submit dinonaktifkan (`disabled`) dan menampilkan loading spinner selama request berlangsung untuk mencegah *double submit*.
2. **Status Badge**:
   - `pending` ➔ Warna Kuning/Amber dengan ikon jam/proses.
   - `approved` ➔ Warna Hijau/Emerald dengan ikon centang.
   - `rejected` ➔ Warna Merah/Rose dengan ikon silang.
3. **Tombol Aksi Baris**:
   - Mengirim ID baris yang tepat ke backend API.
   - Menampilkan loading spinner pada tombol yang diklik selama request `PATCH` berlangsung.
4. **Resiliensi Error**:
   - Jika koneksi API gagal, pesan error ditampilkan melalui Toast dan Alert Banner tanpa menghapus data laporan yang sudah tampil di layar.

---

## 📄 Lisensi
Dibuat untuk keperluan **Technical Assessment - Frontend Test MAPID**.
