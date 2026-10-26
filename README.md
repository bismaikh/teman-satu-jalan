# Teman Satu Jalan (TSJ) - Moeslim Sport Club 🌿

Portal Registrasi Petualang Resmi **Teman Satu Jalan (TSJ) - Moeslim Sport Club**.

Formulir pendaftaran interaktif untuk kegiatan trekking alam ramah syari'ah (pasangan suami-istri, keluarga, saudara semahram, dan sesama ikhwan). Dilengkapi integrasi otomatis ke **Google Sheets** via Google Apps Script, switcher event (Vol 6 aktif & Vol 7 terkunci), manajemen multi-petualang (roster rombongan), validasi responsif mobile, serta undangan grup WhatsApp otomatis.

---

## 🌟 Fitur Utama

- **Event Showcase & Switcher Dinamis**:
  - **Vol 6: Curug Lewibumi (Aktif)** — Informasi rute, tiket, kuota terbatas, dan titik kumpul Kadubereum / Pom Bensin Palima.
  - **Vol 7: Curug Panjang (Digembok)** — Proteksi status terkunci dengan notifikasi ramah bagi peserta.
- **Paket Trekking Fleksibel**:
  - Lovetrail One (Solo / 1 Orang)
  - Lovetrail Couple (Pasangan / 2 Orang)
  - Lovetrail Little (Keluarga / 3 Orang)
  - Lovetrail Squad (Rombongan Sahabat / 4 Orang)
- **Multi-Petualang Dinamis (Roster Rombongan)**:
  - Form otomatis menyesuaikan jumlah kartu petualang sesuai paket yang dipilih.
  - Petualang 1 otomatis menjadi Penanggung Jawab / PIC (Wajib PIC).
  - Kolom isian lengkap: Nama KTP/KIA, Status Peran/Hubungan, Jenis Kelamin, Usia/Kategori, No. WA, Email, dan Catatan Medis/Alergi.
- **Kontak Darurat Terstruktur**:
  - Wajib nomor keluarga di luar jalur demi keselamatan rombongan.
- **Unggah Bukti Transfer & Janji Seru & Aman 🌿**:
  - Dropzone bukti bayar (gambar/PDF).
  - 5 poin komitmen syari'ah, adab petualang muslim, dan keselamatan.
- **Integrasi Otomatis Google Sheets**:
  - Terkoneksi dengan Web App Google Apps Script.
  - Deduping data berdasarkan kode registrasi unik (`TMN1JLN-V6-xxxx`).
- **Tema Dual Mode (Outdoor Day & Forest Night)**:
  - Mode malam hijau tentara & mode siang terang.
- **Mobile Responsive**:
  - Tampilan dioptimalkan khusus untuk layar smartphone (iPhone, Android).

---

## 📁 Struktur Berkas

```
TSJ/
├── index.html                       # Berkas utama form registrasi (siap untuk GitHub Pages)
├── Form Registrasi Peserta Event.html # Berkas form registrasi identik
├── google-apps-script.js             # Kode Google Apps Script untuk Google Sheets
├── logo.png                          # Logo resmi TSJ format PNG transparan (1080x1080)
├── favicon.png                       # Favicon browser format PNG transparan
├── logo.jpg                          # Logo asli TSJ
├── TJ.jpeg                           # Dokumentasi poster TSJ
├── TJ1.jpeg                          # Poster Event Vol 7 (Curug Panjang)
├── TJ2.jpeg                          # Poster Event Vol 6 (Curug Lewibumi)
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
