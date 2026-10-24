# PT Donggi-Senoro LNG (DSLNG) — IT Helpdesk Daily Operations & Shift Reporting Portal

Portal aplikasi web operasional dan pelaporan shift harian terintegrasi untuk Divisi ICT (Information & Communication Technology) **PT Donggi-Senoro LNG**, menghubungkan operasional di **Site Uso (Banggai, Sulawesi Tengah — WITA)** dan **Head Office (Sentra Mulia Jakarta — WIB)**.

Aplikasi ini dirancang untuk mematuhi tata kelola kepatuhan ISO 27001, audit trail terenkripsi, verifikasi jadwal pemeriksaan fisik fasilitas, serta alur tinjauan dan tanda tangan digital superior (*E-Signature Approval*).

---

## 1. Fitur Utama (Key Features)

### A. Kalender Operasional & Manajemen Shift Roster
- **Live Real-time Dual Clock**: Pemantauan waktu operasional secara berdampingan antara **Site Uso (WITA)** dan **HO Jakarta (WIB)**.
- **Roster & Schedule Engine**: Pengaturan jadwal shift harian (*Shift A* dan *Shift B*) untuk teknisi *Helpdesk Engineer* serta penunjukan resmi *Duty Engineer* bertugas.
- **Deteksi Laporan Terlewat (Missing Report Reminders)**: Notifikasi cerdas untuk hari-hari shift kerja yang belum memiliki pengiriman laporan harian.

### B. Form Pelaporan Harian 6 Bagian (Standard Shift Reporting)
Setiap shift diwajibkan menyusun laporan komprehensif yang terbagi menjadi 6 seksi:
1. **Section 1: Tiket & Metrik SLA\***:
   - Pencatatan status tiket harian: *Open*, *On-Hold*, *Pending User*, dan *Closed Today*.
   - Rincian kategori operasional: *Helpdesk*, *MES*, *ERP*, dan *Network / Telecom / Radio*.
   - Input rincian tiket over-SLA (*SLA Breached* & *SLA At Risk*) dengan nomor tiket, PIC teknisi, over SLA duration, dan tindakan mitigasi.
2. **Section 2: Server Check\***:
   - Verifikasi status ketersediaan node server (*Online (Normal)*, *Degraded (Perhatian)*, *Offline (Gangguan)*).
   - Sinkronisasi master data server yang dikelola melalui menu *Infrastructure Fleet*.
3. **Section 3: MS365 & Software Others (Opsional)**:
   - Pemantauan kuota lisensi (*Total Terbeli*, *Assigned / Terpakai*, dan *Available Seats*).
   - Terhubung secara dinamis dengan aset software yang didaftarkan di *Infrastructure Fleet*.
   - Formulir penugasan lisensi baru ke pengguna (*License Assignment*).
4. **Section 4: Physical Check Meeting Room**:
   - Inspeksi fasilitas video conference (Audio pod, display 4K, kabel HDMI/USB-C, Teams/Polycom).
   - Jadwal cek fisik lokasi: **Pukul 06.00 WITA** untuk Site Uso dan **Pukul 07.00 WIB** untuk HO Jakarta sebelum briefing pagi.
   - Lampiran bukti foto fisik langsung pada setiap ruang meeting yang terdaftar.
5. **Section 5: Mailbox & CrowdStrike Security**:
   - Pemantauan kuota mailbox pengguna (>90% hampir penuh dan 100% penuh).
   - Deteksi keamanan endpoint CrowdStrike Falcon (aktivitas mencurigakan/malicious & sensor agent offline >30 hari).
   - Rincian identitas user/hostname terdampak dan tindakan karantina/pembersihan.
6. **Section 6: Catatan Operasional & Handover Briefing**:
   - Ringkasan eksekutif (*Executive Summary*) untuk pimpinan.
   - Catatan serah terima shift (*Shift Handover Briefing*) untuk tim jaga berikutnya.
   - Pengecualian operasional: permintaan pengguna baru, tindak lanjut PO vendor, dan aset rusak (*Broken Assets*).

### C. Infrastructure Fleet Management
Menu terpusat untuk konfigurasi master data fasilitas ICT:
- **Ruang Rapat & Fasilitas Meeting Room**: Pendaftaran ruang konferensi di Site Uso / HO Jakarta dengan spesifikasi perangkat VTC.
- **Node Server Infrastruktur**: Pendaftaran server DC, ERP SAP, MES Telemetry, Core Radio TETRA, dan SCADA Data Diode.
- **Sistem Perangkat Lunak, Lisensi & Aset**: Pendaftaran lisensi software enterprise (*SOFTWARE_LICENSE*) dan kategori kustom dinamis (*OTHER*).

### D. Keamanan, E-Signature & Jejak Audit (ISO 27001)
- **Immutable Lock Hash**: Setiap laporan yang diajukan dikunci menggunakan cryptographic hash SHA-256 untuk menjamin integritas data (anti-tamper).
- **Superior Review Workflow**: Fitur tinjauan oleh *ICT Manager / Superior* dengan opsi *Approve* (disertai tanda tangan digital *Canvas E-Signature* & stempel sertifikasi digital) atau *Reject* (dengan catatan revisi wajib).
- **Audit Trail**: Pencatatan riwayat autentikasi, pembuatan node, pengajuan laporan, dan tinjauan manajerial.

### E. Desain Responsif & Mobile-First
- Dirancang optimal untuk layar **Desktop PC**, **Tablet**, hingga **Smartphone Mobile** tanpa memerlukan scroll horizontal yang menyulitkan pengguna di lapangan.

---

## 2. Kredensial Akses Bawaan (Default Login Credentials)

Aplikasi dilengkapi dengan akun Super Administrator Active Directory bawaan:

| Peran (Role) | Email | Badge / NIK | Kata Sandi | Lokasi |
| :--- | :--- | :--- | :--- | :--- |
| **Super Administrator** | `admin.ict@donggi-senoro.com` | `00001` | `Pac-tina80` | Site Uso |

> **Catatan**: Akun helpdesk engineer dan superior tambahan dapat didaftarkan secara mandiri melalui menu registrasi akun atau dikonfigurasi langsung oleh Administrator.

---

## 3. Kebijakan Data Bersih (Zero-Dummy Policy)

Sistem ini menerapkan prinsip **data operasional bersih**:
- **0 Data Dummy Bawaan**: Seluruh ruang meeting, node server, software lisensi, jadwal shift, dan laporan lampau tidak menggunakan data dummy statis.
- Pengguna dan teknisi memulai dari basis data bersih dan mengisi aset riil melalui menu **Infrastructure Fleet** sebelum menyusun laporan harian shift kerja.

---

## 4. Teknologi & Arsitektur (Tech Stack)

- **Frontend Core**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Iconography**: [Lucide React](https://lucide.dev/)
- **Date & Calendar Logic**: Custom timezone-aware math (WITA UTC+8 & WIB UTC+7)
- **State & Storage**: React Context API dengan sinkronisasi persisten `localStorage`

---

## 5. Panduan Menjalankan Proyek (Getting Started)

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18 atau yang lebih baru
- `npm` atau package manager kompatibel (`bun`, `pnpm`, `yarn`)

### Langkah Instalasi
1. Clone repositori atau buka direktori proyek:
   ```bash
   cd /app/applet
   ```

2. Instal dependensi:
   ```bash
   npm install
   ```

3. Jalankan server pengembangan (Dev Server):
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan secara lokal di port `3000` (e.g. `http://localhost:3000`).

4. Build untuk tahap produksi:
   ```bash
   npm run build
   ```

5. Jalankan linting TypeScript:
   ```bash
   npm run lint
   ```

---

## 6. Struktur Direktori Proyek

```text
├── index.html                   # Entry point dokumen HTML & metadata OpenGraph
├── metadata.json                # Konfigurasi metadata aplikasi AI Studio
├── package.json                 # Konfigurasi dependensi dan scripts npm
├── vite.config.ts               # Konfigurasi build Vite & plugin Tailwind
├── tsconfig.json                # Konfigurasi kompilasi TypeScript
├── public/                      # Aset statis & logo perusahaan
└── src/
    ├── main.tsx                 # Entry point aplikasi React DOM
    ├── App.tsx                  # Root component & routing tampilan modal
    ├── index.css                # Global Tailwind CSS directives
    ├── types/
    │   └── index.ts             # Definisi tipe data TypeScript & interface
    ├── context/
    │   └── AppContext.tsx       # State management global & persistence layer
    ├── data/
    │   └── mockData.ts          # Baseline master data akun Administrator
    ├── utils/
    │   └── rosterLogic.ts       # Utilitas kalkulasi jadwal shift, roster & reminder
    └── components/
        ├── Navbar.tsx                   # Top navigation bar, dual clock & mobile switcher
        ├── CalendarDashboard.tsx        # Kalender bulanan, status tiket & ringkasan shift
        ├── InfrastructureFleetView.tsx  # Master data server, ruang meeting & aset lisensi
        ├── ReportFormModal.tsx          # Form wizard 6 seksi pelaporan harian shift
        ├── ReportDetailModal.tsx        # Tinjauan detail laporan, print PDF & E-Signature
        ├── ShiftRosterModal.tsx         # Manajemen alokasi shift engineer harian
        ├── MissingRemindersModal.tsx    # Daftar reminder laporan shift yang terlewat
        ├── ManageEngineersModal.tsx     # Manajemen akun teknisi & reset password
        ├── AuditTrailModal.tsx          # Log audit aktivitas sistem ISO 27001
        ├── PhotoUploadField.tsx         # Komponen upload & kompresi bukti foto fisik
        └── ToastNotification.tsx        # Toast feedback operasional
```

---

## 7. Lisensi & Hak Cipta

Dokumentasi dan sistem ini dikembangkan untuk standarisasi operasional **PT Donggi-Senoro LNG (DSLNG)**. Seluruh hak cipta dilindungi undang-undang.
