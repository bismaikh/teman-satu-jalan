/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: PENDAFTARAN TEMAN SATU JALAN (MOESLIM SPORT CLUB)
 * =========================================================================
 * 
 * PANDUAN CEPAT PEMASANGAN (HANYA 1 MENIT):
 * 1. Buka Google Spreadsheet baru di browser: https://sheets.new
 * 2. Beri nama spreadsheet, contoh: "Database Peserta Teman Satu Jalan"
 * 3. Klik menu: Extensions (Ekstensi) > Apps Script
 * 4. Hapus semua baris kode yang ada di Apps Script editor.
 * 5. SALIN & TEMPEL (Copy-Paste) seluruh isi kode di bawah ini ke editor.
 * 6. Klik tombol "Deploy" (Terapkan) warna biru di pojok kanan atas > Pilih "New deployment" (Penerapan baru).
 * 7. Pada pop-up, klik ikon gerigi di samping "Select type" > Pilih "Web app" (Aplikasi web).
 * 8. Masukkan pengaturan:
 *    - Description: "Web App Pendaftaran TSJ"
 *    - Execute as: "Me" (Email Google Anda)
 *    - Who has access: "Anyone" (Siapa saja)  <-- PENTING agar form bisa kirim data!
 * 9. Klik "Deploy" > Klik "Authorize access" jika diminta izin akun Google Anda.
 * 10. Salin "Web app URL" yang muncul (akhiran /exec).
 * 11. Buka file "Form Registrasi Peserta Event.html", cari baris:
 *     var GOOGLE_SHEET_WEBAPP_URL = "";
 *     lalu tempelkan URL Web App Anda di antara tanda kutip!
 * =========================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet();

    // Buat Header jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Waktu Pendaftaran",
        "Kode Registrasi",
        "Edisi Event",
        "Paket Trekking",
        "No. Petualang",
        "Nama Lengkap",
        "Status / Hubungan",
        "Jenis Kelamin",
        "Usia / Kategori",
        "No. WhatsApp",
        "Email",
        "Catatan Medis",
        "Alamat Lengkap Domisili",
        "Transportasi Titik Kumpul",
        "Pengalaman Trekking",
        "Intensitas Olahraga",
        "Titik Kumpul",
        "Nama Kontak Darurat",
        "No. HP Darurat",
        "Nama File Bukti Transfer"
      ];
      sheet.appendRow(headers);
      
      // Styling Header: Warna Hijau TSJ & Teks Tebal
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold")
                 .setBackground("#15241b")
                 .setFontColor("#84cc16")
                 .setFontSize(10);
      sheet.setFrozenRows(1);
    }

    var data = JSON.parse(e.postData.contents);
    var timestamp = new Date();

    // Proteksi Anti-Duplikat: Cek apakah kodeRegistrasi sudah tercatat di kolom 2
    var lastRow = sheet.getLastRow();
    if (lastRow > 1 && data.kodeRegistrasi) {
      var existingCodes = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
      for (var r = 0; r < existingCodes.length; r++) {
        if (existingCodes[r][0] && existingCodes[r][0].toString() === data.kodeRegistrasi.toString()) {
          return ContentService.createTextOutput(JSON.stringify({
            status: "success",
            message: "Data rombongan dengan kode " + data.kodeRegistrasi + " sudah tersimpan sebelumnya (duplikat diabaikan)",
            count: 0
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // Masukkan setiap petualang dalam rombongan sebagai 1 baris terpisah
    if (data.explorers && data.explorers.length > 0) {
      data.explorers.forEach(function(exp, idx) {
        var row = [
          timestamp,
          data.kodeRegistrasi || "",
          data.eventNama || "",
          data.paketTrekking || "",
          "Petualang " + (idx + 1),
          exp.nama || "",
          exp.peran || "",
          exp.gender || "",
          exp.usia || "",
          exp.hp || (idx === 0 ? data.leaderHp : ""),
          exp.email || (idx === 0 ? data.leaderEmail : ""),
          exp.medis || "-",
          data.kotaDomisili || "",
          data.transportasi || "",
          data.pengalamanTrek || "",
          data.intensitasOlahraga || "",
          data.titikKumpul || "",
          data.kontakDaruratNama || "",
          data.kontakDaruratHp || "",
          data.buktiTransferFileName || "Tidak ada / Konfirmasi WA"
        ];
        sheet.appendRow(row);
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data rombongan berhasil disimpan ke Google Sheets",
      count: data.explorers ? data.explorers.length : 1
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Endpoint Google Apps Script Teman Satu Jalan aktif & siap menerima data pendaftaran.")
    .setMimeType(ContentService.MimeType.TEXT);
}
