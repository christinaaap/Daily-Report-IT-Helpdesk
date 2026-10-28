# PT Donggi-Senoro LNG (DSLNG) — IT Helpdesk Daily Operations & Shift Reporting Portal

Portal aplikasi web operasional dan pelaporan shift harian terintegrasi untuk Divisi ICT (*Information & Communication Technology*) **PT Donggi-Senoro LNG**, menghubungkan operasional di **Site Uso (Banggai, Sulawesi Tengah — WITA)** dan **Head Office (Sentra Mulia Jakarta — WIB)**.

Aplikasi ini dibangun untuk menjamin standar tata kelola kepatuhan **ISO 27001**, kepatuhan audit operasional migas, integritas laporan dengan *cryptographic hashing*, verifikasi fisik fasilitas berkala, serta alur tinjauan dan tanda tangan digital superior (*E-Signature Approval*).

---

## 1. Fitur Utama (Core Features)

### A. Kalender Operasional & Manajemen Shift Roster
- **Live Real-time Dual Clock**: Jam digital ganda real-time yang memantau waktu operasional **Site Uso (WITA / UTC+8)** dan **HO Jakarta (WIB / UTC+7)** secara simultan.
- **Roster & Schedule Engine**: 
  - Penjadwalan shift kerja (*Shift A*, *Shift B*, *Normal Shift*) dikelola secara terpusat oleh **Administrator**.
  - Penentuan resmi *Duty Engineer* bertugas per hari dan per lokasi.
  - Perubahan shift dapat di-assign mingguan atau harian dengan fleksibel.
- **Deteksi Laporan Terlewat (Missing Reports)**:
  - Notifikasi cerdas untuk mendeteksi tanggal shift yang belum memiliki pengiriman laporan harian.
  - Akses cepat langsung dari banner notifikasi menuju form pembuatan laporan pada tanggal terkait.

### B. Formulir Pelaporan Harian 6 Bagian (Standardized 6-Section Shift Report)
Pengisian laporan harian shift distandardisasi ke dalam 6 seksi terstruktur:
1. **Section 1: Tiket & Metrik SLA\***:
   - Pencatatan status volume tiket harian (*Open*, *On-Hold*, *Pending User*, dan *Closed Today*).
   - Klasifikasi 4 pilar operasional: *Helpdesk*, *MES (Manufacturing Execution System)*, *ERP*, dan *Network / Telecom / Radio*.
   - Tabel tiket bermasalah (*SLA Breached* & *SLA At Risk*) mencakup nomor tiket, PIC teknisi, durasi over-SLA, dan tindakan mitigasi.
2. **Section 2: Server Check\***:
   - Pengecekan status ketersediaan node server (*Online (Normal)*, *Degraded (Perhatian)*, *Offline (Gangguan)*).
   - Data server tersinkronisasi otomatis dari master data **Infrastructure Fleet**.
   - *Catatan Kepatuhan*: Penambahan server baru hanya dapat dilakukan melalui menu Infrastructure Fleet (tidak dapat ditambah sembarangan saat pengisian laporan harian).
3. **Section 3: MS365 & Software Lisensi (Opsional)**:
   - Pemantauan alokasi lisensi (*Total Terbeli*, *Assigned / Terpakai*, dan *Available Seats*).
   - Terhubung secara dinamis dengan daftar software yang telah didaftarkan di **Infrastructure Fleet**.
   - Formulir penugasan lisensi baru ke pengguna (*License Assignment*).
4. **Section 4: Physical Check Meeting Room**:
   - Inspeksi fasilitas video conference dan ruang rapat (Audio pod, display TV/projector, kabel HDMI/Type-C, Polycom/Teams Rooms).
   - Standar jam inspeksi fisik: **06.00 WITA** (Site Uso) dan **07.00 WIB** (HO Jakarta) sebelum jam kantor/briefing pagi dimulai.
   - Lampiran bukti foto fisik langsung (*Photo Upload & Compression*) untuk setiap ruang rapat yang dicek.
5. **Section 5: Mailbox & CrowdStrike Security**:
   - Pemantauan kuota mailbox pengguna (>90% waspada dan 100% penuh).
   - Pengecekan sensor keamanan endpoint **CrowdStrike Falcon** (deteksi ancaman malware/malicious dan sensor offline >30 hari).
   - Pencatatan identitas user / hostname terdampak beserta tindakan isolasi atau karantina.
6. **Section 6: Catatan Operasional & Handover Briefing**:
   - Ringkasan eksekutif (*Executive Summary*) untuk konsumsi manajemen.
   - Catatan serah terima shift (*Shift Handover Briefing*) untuk tim jaga berikutnya.
   - Pencatatan aset rusak (*Broken Assets*), permintaan user baru, dan tindak lanjut PO/vendor.

### C. Infrastructure Fleet Management
Modul terpusat bagi Administrator dan personel untuk mengelola master data aset ICT:
- **Ruang Rapat & Fasilitas VTC**: Registrasi ruang rapat di Site Uso / HO Jakarta dengan detail perangkat audio/video.
- **Node Server Infrastruktur**: Registrasi server Active Directory, ERP SAP, MES Telemetry, SCADA Data Diode, Radio TETRA, dan backup node.
- **Sistem Perangkat Lunak & Lisensi**: Registrasi aplikasi enterprise (*SOFTWARE_LICENSE*) dan kategori utilitas (*OTHER*).

### D. Keamanan, E-Signature & Jejak Audit (ISO 27001)
- **Immutable Lock Cryptographic Hash**: Setiap laporan yang diajukan dikunci menggunakan hash SHA-256 untuk menjamin integritas data (anti-tamper).
- **Superior Review & Approval Workflow**:
  - *ICT Manager / Superior* meninjau laporan harian.
  - Opsi persetujuan (*Approve*) dengan tanda tangan digital pada kanvas (*Canvas E-Signature*) serta stempel sertifikasi digital bertanda waktu.
  - Opsi penolakan (*Reject*) dengan kewajiban mengisi alasan revisi kepada teknisi terkait.
- **Audit Trail**: Pencatatan riwayat autentikasi login/logout, penambahan aset, pengajuan laporan, dan persetujuan manajerial secara lengkap dan transparan.

### E. Desain Responsif & Mobile-First
- Antarmuka responsif penuh (*zero horizontal scroll*) yang nyaman digunakan pada monitor Desktop PC, Laptop, Tablet, hingga Layar Smartphone teknisi di lapangan.

---

## 2. Manajemen Akun & Hak Akses (Role-Based Access Control)

Aplikasi membedakan hak akses berdasarkan 3 peran (*Role*):

| Peran (Role) | Hak Akses Utama |
| :--- | :--- |
| **Administrator (Super Admin)** | Akses penuh: Roster Jadwal Shift mingguan, Infrastructure Fleet, Manajemen Personel & Reset Password, Audit Trail, Pengisian & Review Laporan. |
| **Superior / ICT Manager** | Akses peninjauan: Evaluasi laporan harian, Approval dengan Tanda Tangan Digital (E-Signature), Penolakan Revisi, dan Inspeksi Fleet. |
| **Helpdesk Engineer** | Akses operasional: Pengisian Laporan Harian 6 Bagian, Cek Fisik Ruang Rapat, Pemantauan Server & Lisensi. |

### Kredensial Bawaan (Default Login Credentials)
Aplikasi dilengkapi akun Super Administrator Active Directory bawaan:

| Parameter | Nilai Akun Bawaan |
| :--- | :--- |
| **Email** | `admin.ict@donggi-senoro.com` |
| **Badge / NIK** | `00001` |
| **Kata Sandi** | `Pac-tina80` |
| **Lokasi** | Site Uso (Plant Batui - WITA) |

### Alur Pendaftaran Akun Baru (Self-Registration)
- Personel baru (*Helpdesk Engineer* atau *Superior*) dapat mendaftarkan akun secara mandiri melalui tab **Daftar Akun Baru**.
- Pada formulir registrasi, **pengisian shift/jadwal kerja sengaja ditiadakan**.
- **Alasan**: Jadwal kerja teknisi dan manager berubah dinamis setiap minggu dan diatur secara otoritatif oleh Administrator melalui menu **Roster Jadwal Shift**.

---

## 3. Kebijakan Data Bersih (Zero-Dummy Policy)

Sistem ini menerapkan prinsip **data operasional bersih**:
- **0 Data Dummy Bawaan**: Seluruh ruang meeting, node server, lisensi software, jadwal shift, dan laporan lampau tidak menggunakan data dummy statis.
- Data aset riil didaftarkan melalui menu **Infrastructure Fleet** sebelum teknisi menyusun laporan harian shift kerja.

---

## 4. Alur Kerja Operasional Standar (Standard Operating Procedure)

1. **Langkah 1 — Registrasi & Autentikasi**:
   - Teknisi masuk menggunakan email/Badge NIK dan kata sandi yang telah didaftarkan.
2. **Langkah 2 — Penjadwalan Shift (Administrator)**:
   - Administrator membuka modal **Roster Jadwal Shift** untuk mengatur shift harian teknisi (*Shift A / Shift B*) dan menunjuk *Duty Engineer*.
3. **Langkah 3 — Pemeliharaan Master Data (Infrastructure Fleet)**:
   - Pastikan ruang meeting, node server, dan software lisensi yang aktif telah didaftarkan di modul **Infrastructure Fleet**.
4. **Langkah 4 — Pengisian Laporan Harian**:
   - Klik tombol **Buat Laporan Hari Ini** atau pilih tanggal pada kalender.
   - Isi keenam seksi formulir: Tiket SLA, Cek Server, Cek Lisensi, Cek Fisik Ruang Rapat (dengan foto), Cek Keamanan CrowdStrike & Mailbox, serta Catatan Handover.
   - Ajukan laporan (*Submit Report*). Data akan terkunci (*Locked*) dengan hash kriptografi SHA-256.
5. **Langkah 5 — Review & Approval Superior**:
   - Superior / ICT Manager membuka laporan yang berstatus *Submitted*.
   - Melakukan verifikasi data, membubuhkan tanda tangan digital e-signature, dan menyetujui laporan (*Approve*).

---

## 5. Teknologi & Dependensi (Tech Stack)

- **Frontend Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **CSS Framework**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icon Pack**: [Lucide React](https://lucide.dev/)
- **Timezone Calculation**: Native JavaScript `Intl.DateTimeFormat` (WITA UTC+8 & WIB UTC+7)
- **State Management & Persistence**: React Context API terintegrasi dengan browser `localStorage`

---

## 6. Panduan Menjalankan Aplikasi Secara Lokal

### Prasyarat Sistem
- [Node.js](https://nodejs.org/) versi 18 atau yang lebih baru
- `npm` (atau `yarn`, `pnpm`)

### Langkah Menjalankan
1. Masuk ke direktori proyek:
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
   Aplikasi akan aktif di `http://localhost:3000`.

4. Validasi sintaksis TypeScript (Lint):
   ```bash
   npm run lint
   ```

5. Build untuk produksi:
   ```bash
   npm run build
   ```

---

## 7. Struktur Direktori Proyek

```text
├── index.html                     # Entry point dokumen HTML & OpenGraph meta tags
├── metadata.json                  # Metadata proyek AI Studio
├── package.json                   # Konfigurasi dependensi dan scripts npm
├── vite.config.ts                 # Konfigurasi build Vite & Tailwind CSS
├── tsconfig.json                  # Konfigurasi compiler TypeScript
├── README.md                      # Dokumentasi komprehensif sistem
├── public/                        # Aset statis & logo perusahaan
└── src/
    ├── main.tsx                   # Entry point aplikasi React DOM
    ├── App.tsx                    # Komponen root & navigasi modal
    ├── index.css                  # Directives Tailwind CSS
    ├── types/
    │   └── index.ts               # Definisi tipe data TypeScript & interface
    ├── context/
    │   └── AppContext.tsx         # State management global & persistence layer
    ├── data/
    │   └── mockData.ts            # Akun default Administrator
    ├── utils/
    │   └── rosterLogic.ts         # Logika jadwal shift, roster mingguan & reminder
    └── components/
        ├── Navbar.tsx                     # Header navigasi, dual clock (WITA/WIB) & user menu
        ├── LoginPage.tsx                  # Halaman autentikasi login & formulir registrasi akun
        ├── CalendarDashboard.tsx          # Kalender bulanan, metrik tiket & filter status
        ├── InfrastructureFleetView.tsx    # Manajemen server, ruang meeting & software lisensi
        ├── ReportFormModal.tsx            # Form wizard 6 seksi pelaporan harian shift
        ├── ReportDetailModal.tsx          # Detail laporan, cetak PDF & modal review superior
        ├── DigitalSignaturePad.tsx        # Kanvas tanda tangan digital E-Signature
        ├── RosterScheduleModal.tsx        # Pengaturan jadwal shift mingguan oleh Administrator
        ├── MissingReportsModal.tsx        # Dialog pengingat laporan harian yang terlewat
        ├── ManageEngineersModal.tsx       # Manajemen akun pengguna & reset password oleh Admin
        ├── AuditTrailView.tsx             # Log aktivitas operasional terenkripsi (ISO 27001)
        ├── PhotoUploadField.tsx           # Komponen upload & kompresi foto fisik ruang meeting
        └── Toast.tsx                      # Notifikasi toast status operasional
```

---

## 8. Lisensi & Hak Cipta

Dokumentasi dan sistem ini dikembangkan untuk standarisasi operasional teknologi informasi dan komunikasi **PT Donggi-Senoro LNG (DSLNG)**. Seluruh hak cipta dilindungi undang-undang.
