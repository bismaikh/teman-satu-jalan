# Teman Satu Jalan (TSJ) - Moeslim Sport Club 🌿

Portal Registrasi Petualang Resmi **Teman Satu Jalan (TSJ) - Moeslim Sport Club**.

Formulir pendaftaran interaktif untuk kegiatan trekking alam ramah syari'ah (pasangan suami-istri, keluarga, saudara semahram, dan sesama ikhwan). Dilengkapi integrasi otomatis ke **Google Sheets** via Google Apps Script, switcher event (Vol 6 aktif & Vol 7 terkunci), manajemen multi-petualang (roster rombongan), validasi responsif mobile, serta undangan grup WhatsApp otomatis.

---

## 🌟 Fitur Utama

- **Event Showcase & Switcher Dinamis**:
  - **Vol 6: Curug Lewibumi** — Rute 4 KM, meeting point Kadubereum / SPBU Palima.
  - **Vol 7: Curug Panjang** — Rute 5 KM, meeting point Bukit Waruwangi / Rest Area Tol Cilegon Timur. Dilengkapi **Interactive Carousel 4 Slide** (TJ1.jpeg, TJ21.png, TJ22.png, TJ12.jpeg).
  - **Pilihan Awal Ekspedisi**: Pengunjung memilih ekspedisi terlebih dahulu sebelum form dan detail ditampilkan.
- **Pilihan Skema Pembayaran (DP 50% & Lunas 100%)**:
  - **Lunas (100%)**: Bayar penuh sekarang, pendaftaran langsung terkonfirmasi tuntas.
  - **DP (Uang Muka 50%)**: Cukup bayar 50% untuk mengamankan kuota slot petualang. Sisa pelunasan (50%) wajib dibayarkan paling lambat **H-7 sebelum hari keberangkatan trip**.
  - Nominal QRIS dihitung dan disesuaikan otomatis saat memilih paket dan skema pembayaran.
- **Paket Trekking Fleksibel**:
  - **Vol 6**: Single (160K), Couple (320K), Little Family (475K), Squad Family (630K).
  - **Vol 7**: Single (200K), Couple (400K), Little Family (585K), Squad Family (775K).
- **Multi-Petualang Dinamis (Roster Rombongan)**:
  - Form otomatis menyesuaikan jumlah kartu petualang sesuai paket yang dipilih.
  - Petualang 1 otomatis menjadi Penanggung Jawab / PIC (Wajib PIC).
  - Kolom isian lengkap: Nama KTP/KIA, Status Peran/Hubungan, Jenis Kelamin, Usia/Kategori, No. WA, Email, dan Catatan Medis/Alergi.
- **Metode Pembayaran QRIS Resmi (Semua Bank & E-Wallet)**:
  - Pembayaran instan via QRIS (BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, ShopeePay, dll).
  - Merchant: **ADVENTURE TEMANSATUJALAN** • NMID: `ID1025375876469` (fitur salin NMID, unduh QRIS, dan zoom modal).
- **Desain Google Spreadsheet Menarik & Otomatis**:
  - **Tab 1: 📊 DASHBOARD & REKAP** — Kartu Metrik KPI (Total Petualang, Total Rombongan, Total Kas Masuk, Sisa Tagihan DP, Rekap Gender Ikhwan/Akhwat, dan Tabel Rekap per Event).
  - **Tab 2: 👥 Data Peserta** — Master database lengkap dengan tema Forest Emerald & Lime, zebra striping, format Rupiah (`Rp #,##0`), serta conditional formatting otomatis.
  - **Tab 3: 💰 Monitoring Pelunasan H-7** — Monitoring khusus peserta DP lengkap dengan **Link Klik Langsung WhatsApp** untuk menyapa & mengingatkan peserta.
  - **Menu Khusus Google Sheets (`🌿 Teman Satu Jalan`)**: Satu klik untuk re-design, refresh rumus, dan insert data simulasi.
- **Tema Dual Mode (Outdoor Day & Forest Night)**:
  - Mode malam hijau tentara & mode siang terang.
- **Mobile Responsive**:
  - Tampilan dioptimalkan khusus untuk layar smartphone (iPhone, Android).

---

## 📁 Struktur Berkas

```
TSJ/
├── index.html                       # Berkas utama form registrasi (siap untuk GitHub Pages)
├── google-apps-script.js             # Kode Google Apps Script untuk Google Sheets
├── qris.png                          # Gambar QRIS resmi (ADVENTURE TEMANSATUJALAN) cropped transparan
├── qr.jpeg                           # Gambar asli poster QRIS merchant
├── logo.png                          # Logo resmi TSJ format PNG transparan (1080x1080)
├── favicon.png                       # Favicon browser format PNG transparan
├── logo.jpg                          # Logo asli TSJ
├── info.jpeg                         # Poster Infografis Resmi Vol 6 (Paket & Harga Terbaru)
├── TJ1.jpeg                          # Poster Event Vol 7 (Curug Panjang)
├── TJ2.jpeg                          # Poster Foto Event Vol 6 (Curug Lewibumi)
├── adventure-hero.jpg                # Foto ilustrasi trekking
├── .gitignore                        # Konfigurasi file git
└── README.md                         # Dokumentasi proyek
```

---

## 🚀 Cara Menjalankan

### 1. Lokal di Browser
Cukup buka berkas `index.html` atau `Form Registrasi Peserta Event.html` langsung di browser favorit Anda (Google Chrome, Edge, Safari, Firefox).

### 2. Mengaktifkan GitHub Pages
1. Masuk ke **Settings** repository di GitHub.
2. Pilih menu **Pages** di sidebar kiri.
3. Pada bagian **Build and deployment > Branch**, pilih branch `main` dan folder `/ (root)`.
4. Klik **Save**. Situs akan aktif di `https://bismaikh.github.io/teman-satu-jalan/`.

---

## 🔗 Kontak Resmi TSJ

- **Admin Pendaftaran 1**: [0858 8258 2729](https://wa.me/6285882582729)
- **Admin Pendaftaran 2**: [0858 1147 4778](https://wa.me/6285811474778)
- **Komunitas**: Teman Satu Jalan (TMN1JLN.) - Moeslim Sport Club
