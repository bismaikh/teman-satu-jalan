/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: PENDAFTARAN & DASHBOARD DATABASE TEMAN SATU JALAN
 * =========================================================================
 * 
 * ✨ FITUR DESAIN SPREADSHEET PREMIUM:
 * 1. 📊 TAB "DASHBOARD & REKAP":
 *    - Kartu Metrik KPI: Total Petualang, Total Rombongan, Total Kas Masuk, Sisa Tagihan DP.
 *    - Rekap Peserta Lunas vs Menunggu Pelunasan (H-7).
 *    - Rekap Gender: Ikhwan & Akhwat.
 *    - Tabel Rekapitulasi per Edisi Trip (Vol 6 vs Vol 7) & Kategori Paket.
 * 
 * 2. 👥 TAB "DATA PESERTA" (MASTER DATABASE):
 *    - Header Eksklusif bertema Forest Emerald & TSJ Lime (#15241b & #84cc16).
 *    - Freeze Header & Filter Baris Otomatis.
 *    - Pewarnaan Baris Selang-Seling (Zebra Striping) yang nyaman di mata.
 *    - Format Otomatis Mata Uang Rupiah (Rp #,##0) pada kolom Keuangan.
 *    - Pewarnaan Kondisional Otomatis:
 *      • LUNAS: Hijau Lembut (#dcfce7 / #15803d)
 *      • BELUM LUNAS (DP): Kuning-Amber (#fef3c7 / #b45309)
 *      • Catatan Medis Khusus: Merah Muda Lembut (#ffe4e6 / #9f1239)
 * 
 * 3. 💰 TAB "MONITORING PELUNASAN H-7":
 *    - Daftar otomatis peserta yang memilih DP 50%.
 *    - Menghitung sisa pelunasan dan menyediakan Link Klik Langsung WhatsApp ke PIC!
 * 
 * 4. 🌿 MENU KHUSUS DI GOOGLE SHEETS:
 *    - Saat spreadsheet dibuka, muncul menu "🌿 Teman Satu Jalan" di bar menu atas.
 *    - Satu klik "🎨 Desain Ulang & Percantik Spreadsheet" untuk auto-format!
 * 
 * =========================================================================
 * PANDUAN PEMASANGAN CEPAT (HANYA 1 MENIT):
 * =========================================================================
 * 1. Buka Google Spreadsheet baru: https://sheets.new
 * 2. Beri nama file, contoh: "Database Teman Satu Jalan - Moeslim Sport Club"
 * 3. Klik menu: Extensions (Ekstensi) > Apps Script
 * 4. Hapus seluruh kode bawaan editor, lalu PASTE SELURUH KODE DI BAWAH INI.
 * 5. Pilih fungsi "setupSpreadsheetLengkap" pada dropdown di toolbar atas > Klik "Run" (Jalankan).
 *    (Berikan izin/otorisasi akun Google Anda jika diminta).
 *    -> Seketika spreadsheet Anda akan berubah menjadi Dashboard & Database Cantik!
 * 6. Klik tombol "Deploy" (Terapkan) warna biru di pojok kanan atas > Pilih "New deployment".
 * 7. Pada ikon gerigi "Select type", pilih "Web app".
 * 8. Pengaturan:
 *    - Description: "Web App Pendaftaran TSJ"
 *    - Execute as: "Me" (Email Google Anda)
 * 10. Web App URL Aktif:
 *     https://script.google.com/macros/s/AKfycbwVy1aa2ajN8W7o7MGl6FLWeFLaGgoy89GIuWf350sBwgngUNdDVQ111PiA2Y_u3CjPPg/exec
 * =========================================================================
 */

// =============================================================================
// 1. MENU KHUSUS GOOGLE SHEETS (DITAMPILKAN OTOMATIS SAAT SPREADSHEET DIBUKA)
// =============================================================================
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("🌿 Teman Satu Jalan")
    .addItem("🎨 Desain Ulang & Percantik Spreadsheet", "setupSpreadsheetLengkap")
    .addItem("📊 Perbarui Rumus Dashboard Rekap", "buatTabDashboard")
    .addItem("💰 Perbarui Sheet Monitoring Pelunasan", "buatTabMonitoringDp")
    .addSeparator()
    .addItem("🧪 Masukkan Data Contoh (Simulasi)", "isiDataSimulasi")
    .addToUi();
}

// =============================================================================
// 2. WEBHOOK POST (MENERIMA KIRIMAN DATA DARI FORMULIR PENDAFTARAN)
// =============================================================================
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName("👥 Data Peserta");

    // Jika spreadsheet belum diinisialisasi atau sheet data belum ada, buat desain lengkapnya
    if (!sheet || sheet.getLastRow() < 3) {
      setupSpreadsheetLengkap();
      sheet = doc.getSheetByName("👥 Data Peserta");
    }

    var data = JSON.parse(e.postData.contents);
    var timestamp = new Date();

    // Proteksi Anti-Duplikat berdasarkan kodeRegistrasi
    var lastRow = sheet.getLastRow();
    if (lastRow >= 4 && data.kodeRegistrasi) {
      var existingCodes = sheet.getRange(4, 2, lastRow - 3, 1).getValues();
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

    // Parsing data skema, nominal, dan sisa
    var skema = data.skemaPembayaran || (data.metodePembayaran && data.metodePembayaran.indexOf("DP") !== -1 ? "DP (50%)" : "Lunas (100%)");
    var nominalAngka = parseNominal(data.nominalBayar || data.nominal || 0);
    var sisaAngka = parseNominal(data.sisaPelunasan || 0);
    var isDp = skema.indexOf("DP") !== -1 || sisaAngka > 0;
    var statusBayar = isDp ? "BELUM LUNAS (H-7)" : "LUNAS";

    // Masukkan setiap anggota petualang ke dalam baris tabel
    if (data.explorers && data.explorers.length > 0) {
      var startRow = sheet.getLastRow() + 1;
      var newRows = [];

      data.explorers.forEach(function (exp, idx) {
        var isLeader = (idx === 0);
        var noUrut = sheet.getLastRow() - 2 + idx; // Nomor urut petualang di sheet

        var row = [
          noUrut,                                                 // Kolom 1: No
          data.kodeRegistrasi || "",                              // Kolom 2: Kode Registrasi
          timestamp,                                              // Kolom 3: Waktu Pendaftaran
          data.eventNama || "",                                   // Kolom 4: Edisi Event
          data.paketTrekking || "",                               // Kolom 5: Kategori Paket
          skema,                                                  // Kolom 6: Skema Bayar
          isLeader ? nominalAngka : 0,                            // Kolom 7: Nominal Bayar (diberikan ke PIC agar total sum tidak ganda)
          isLeader ? sisaAngka : 0,                               // Kolom 8: Sisa Pelunasan (diberikan ke PIC)
          statusBayar,                                            // Kolom 9: Status Bayar
          isLeader ? "Petualang 1 (PIC)" : ("Petualang " + (idx + 1)), // Kolom 10: Peran
          exp.nama || "",                                         // Kolom 11: Nama Lengkap
          exp.peran || (isLeader ? "Ketua Rombongan" : "Anggota"),// Kolom 12: Hubungan / Peran
          exp.gender || "",                                       // Kolom 13: Gender
          exp.usia || "",                                         // Kolom 14: Usia / Kategori
          "'" + (exp.hp || (isLeader ? data.leaderHp : "")),      // Kolom 15: No. WhatsApp
          exp.email || (isLeader ? data.leaderEmail : ""),        // Kolom 16: Email
          exp.medis || "-",                                       // Kolom 17: Catatan Medis
          data.kotaDomisili || data.alamatLengkap || "",          // Kolom 18: Alamat Domisili
          data.transportasi || "",                                // Kolom 19: Transportasi
          data.titikKumpul || "",                                 // Kolom 20: Titik Kumpul
          (data.pengalamanTrek || "-") + " • " + (data.intensitasOlahraga || "-"), // Kolom 21: Pengalaman & Fisik
          data.kontakDaruratNama || "",                           // Kolom 22: Kontak Darurat
          "'" + (data.kontakDaruratHp || ""),                     // Kolom 23: No. HP Darurat
          data.buktiTransferFileName || "Struk QRIS Terlampir"    // Kolom 24: Bukti Transfer
        ];
        newRows.push(row);
      });

      // Tulis sekaligus untuk kecepatan maksimal
      var targetRange = sheet.getRange(startRow, 1, newRows.length, newRows[0].length);
      targetRange.setValues(newRows);

      // Terapkan styling baris yang rapi & estetik
      formatDataRows(sheet, startRow, newRows.length);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Alhamdulillah! Data rombongan berhasil dicatat dan didesain di Google Spreadsheet.",
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
  return ContentService.createTextOutput(
    "🌿 Endpoint Google Apps Script Teman Satu Jalan Aktif!\n" +
    "Database siap menerima kiriman pendaftaran dari portal web."
  ).setMimeType(ContentService.MimeType.TEXT);
}

// =============================================================================
// 3. MASTER SETUP DESAIN SPREADSHEET LENGKAP
// =============================================================================
function setupSpreadsheetLengkap(docInstance) {
  var doc = docInstance || SpreadsheetApp.getActiveSpreadsheet();

  // 1. Buat & Format Tab Data Peserta (Master Database)
  var sheetPeserta = buatTabDataPeserta(doc);

  // 2. Buat & Format Tab Dashboard & Rekap
  buatTabDashboard(doc);

  // 3. Buat & Format Tab Monitoring Pelunasan H-7
  buatTabMonitoringDp(doc);

  // Jadikan Tab Dashboard sebagai tampilan utama yang aktif
  var dashSheet = doc.getSheetByName("📊 DASHBOARD & REKAP");
  if (dashSheet) {
    doc.setActiveSheet(dashSheet);
  }

  // Tampilkan notifikasi jika dijalankan manual dari menu
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      "Desain Spreadsheet Teman Satu Jalan berhasil diterapkan! Tab Dashboard, Data Peserta & Pelunasan telah siap.",
      "🌿 Desain Sukses",
      5
    );
  } catch (e) { }
}

// =============================================================================
// 4. PEMBUATAN & STYLING TAB "👥 DATA PESERTA"
// =============================================================================
function buatTabDataPeserta(doc) {
  var sheetName = "👥 Data Peserta";
  var sheet = doc.getSheetByName(sheetName);

  if (!sheet) {
    sheet = doc.insertSheet(sheetName);
  }

  // Bersihkan sheet jika masih baru (baris < 3)
  if (sheet.getLastRow() < 3) {
    sheet.clear();

    // BARIS 1: BANNER JUDUL RESMI
    sheet.getRange("A1:X1").merge()
      .setValue("🌲 TEMAN SATU JALAN (MOESLIM SPORT CLUB) — MASTER DATABASE PENDAFTARAN & ROSTER PETUALANG")
      .setFontFamily("Arial")
      .setFontSize(12)
      .setFontWeight("bold")
      .setFontColor("#84cc16")
      .setBackground("#0f281b")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle");
    sheet.setRowHeight(1, 38);

    // BARIS 2: PANDUAN WARNA (LEGEND PILL)
    sheet.getRange("A2:X2").merge()
      .setValue("💡 PANDUAN STATUS:  [HIJAU] Lunas (100%)  •  [KUNING/AMBER] DP (50%) Wajib Pelunasan Maks. H-7  •  [MERAH MUDA] Ada Catatan Medis Khusus")
      .setFontFamily("Arial")
      .setFontSize(8.5)
      .setFontColor("#cbd5e1")
      .setBackground("#15241b")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle");
    sheet.setRowHeight(2, 24);

    // BARIS 3: HEADER KOLOM
    var headers = [
      "No",
      "Kode Registrasi",
      "Waktu Pendaftaran",
      "Edisi Event",
      "Kategori Paket",
      "Skema Bayar",
      "Nominal Bayar",
      "Sisa Pelunasan",
      "Status Bayar",
      "Peran Peserta",
      "Nama Lengkap Petualang",
      "Status / Hubungan",
      "Gender",
      "Usia / Kategori",
      "No. WhatsApp",
      "Email",
      "Catatan Medis",
      "Alamat Domisili",
      "Transportasi",
      "Titik Kumpul",
      "Pengalaman & Fisik",
      "Nama Kontak Darurat",
      "No. HP Darurat",
      "Bukti Transfer QRIS"
    ];

    var headerRange = sheet.getRange(3, 1, 1, headers.length);
    headerRange.setValues([headers])
      .setFontFamily("Arial")
      .setFontSize(9.5)
      .setFontWeight("bold")
      .setFontColor("#ffffff")
      .setBackground("#1e3a2b")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setWrap(true);
    sheet.setRowHeight(3, 36);

    // Bekukan 3 baris teratas dan kolom Kode Registrasi
    sheet.setFrozenRows(3);
    sheet.setFrozenColumns(2);

    // Atur lebar kolom yang proporsional & nyaman dibaca
    var widths = [
      45,   // No
      130,  // Kode Registrasi
      140,  // Waktu Pendaftaran
      160,  // Edisi Event
      170,  // Kategori Paket
      120,  // Skema Bayar
      115,  // Nominal Bayar
      115,  // Sisa Pelunasan
      145,  // Status Bayar
      125,  // Peran Peserta
      170,  // Nama Lengkap
      140,  // Status Hubungan
      85,   // Gender
      90,   // Usia
      130,  // WhatsApp
      160,  // Email
      140,  // Medis
      180,  // Domisili
      130,  // Transportasi
      160,  // Tikum
      150,  // Pengalaman & Fisik
      150,  // Kontak Darurat
      130,  // HP Darurat
      160   // Bukti Transfer
    ];
    for (var c = 0; c < widths.length; c++) {
      sheet.setColumnWidth(c + 1, widths[c]);
    }

    // Pasang Aturan Format Bersyarat (Conditional Formatting)
    pasangFormatBersyarat(sheet);
  }

  return sheet;
}

// Format baris data baru agar rapi, memiliki border halus & number format mata uang
function formatDataRows(sheet, startRow, rowCount) {
  var range = sheet.getRange(startRow, 1, rowCount, 24);
  range.setFontFamily("Arial")
    .setFontSize(9)
    .setVerticalAlignment("middle");

  // Format Angka Mata Uang Rupiah untuk Nominal & Sisa
  sheet.getRange(startRow, 7, rowCount, 2).setNumberFormat('"Rp"#,##0');
  sheet.getRange(startRow, 3, rowCount, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");

  // Alignment per kolom
  sheet.getRange(startRow, 1, rowCount, 1).setHorizontalAlignment("center"); // No
  sheet.getRange(startRow, 2, rowCount, 1).setHorizontalAlignment("center").setFontWeight("bold"); // Kode
  sheet.getRange(startRow, 3, rowCount, 1).setHorizontalAlignment("center"); // Waktu
  sheet.getRange(startRow, 6, rowCount, 1).setHorizontalAlignment("center").setFontWeight("bold"); // Skema
  sheet.getRange(startRow, 7, rowCount, 2).setHorizontalAlignment("right");  // Nominal & Sisa
  sheet.getRange(startRow, 9, rowCount, 2).setHorizontalAlignment("center").setFontWeight("bold"); // Status & Peran
  sheet.getRange(startRow, 13, rowCount, 3).setHorizontalAlignment("center"); // Gender, Usia, WA
  sheet.getRange(startRow, 23, rowCount, 1).setHorizontalAlignment("center"); // HP Darurat

  // Border abu-abu halus antar sel
  range.setBorder(true, true, true, true, true, true, "#e2e8f0", SpreadsheetApp.BorderStyle.SOLID);

  // Pewarnaan baris selang-seling (Zebra striping)
  for (var i = 0; i < rowCount; i++) {
    var currentRow = startRow + i;
    sheet.setRowHeight(currentRow, 26);
    var bg = (currentRow % 2 === 0) ? "#ffffff" : "#f7faf6";
    sheet.getRange(currentRow, 1, 1, 24).setBackground(bg);
  }
}

// Pasang Aturan Highlight Otomatis
function pasangFormatBersyarat(sheet) {
  var rules = sheet.getConditionalFormatRules();

  // 1. Highlight LUNAS -> Latar Hijau Muda, Teks Hijau Tua Tebal
  var ruleLunas = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains("LUNAS")
    .setBackground("#dcfce7")
    .setFontColor("#15803d")
    .setBold(true)
    .setRanges([sheet.getRange("I4:I")])
    .build();

  // 2. Highlight BELUM LUNAS (DP) -> Latar Kuning/Oranye Muda, Teks Coklat/Amber Tebal
  var ruleDp = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains("BELUM LUNAS")
    .setBackground("#fef3c7")
    .setFontColor("#b45309")
    .setBold(true)
    .setRanges([sheet.getRange("I4:I")])
    .build();

  // 3. Highlight Catatan Medis Khusus (selain "-" atau kosong) -> Merah Muda Peringatan
  var ruleMedis = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND(Q4<>""; Q4<>"-"; LOWER(Q4)<>"tidak ada")')
    .setBackground("#ffe4e6")
    .setFontColor("#9f1239")
    .setBold(true)
    .setRanges([sheet.getRange("Q4:Q")])
    .build();

  // 4. Highlight Petualang 1 (PIC) -> Sedikit Biru Lembut
  var rulePic = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains("PIC")
    .setBackground("#f0fdf4")
    .setFontColor("#14532d")
    .setBold(true)
    .setRanges([sheet.getRange("J4:J")])
    .build();

  rules.push(ruleLunas, ruleDp, ruleMedis, rulePic);
  sheet.setConditionalFormatRules(rules);
}

// =============================================================================
// 5. PEMBUATAN & STYLING TAB "📊 DASHBOARD & REKAP"
// =============================================================================
function buatTabDashboard(docInstance) {
  var doc = docInstance || SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "📊 DASHBOARD & REKAP";
  var sheet = doc.getSheetByName(sheetName);

  if (!sheet) {
    sheet = doc.insertSheet(sheetName, 0); // Buat di posisi paling pertama (tab paling kiri)
  }

  sheet.clear();
  sheet.setHiddenGridlines(false);

  // Set lebar kolom dashboard
  sheet.setColumnWidth(1, 25);   // A (Margin)
  sheet.setColumnWidth(2, 140);  // B
  sheet.setColumnWidth(3, 130);  // C
  sheet.setColumnWidth(4, 140);  // D
  sheet.setColumnWidth(5, 130);  // E
  sheet.setColumnWidth(6, 140);  // F
  sheet.setColumnWidth(7, 130);  // G
  sheet.setColumnWidth(8, 140);  // H
  sheet.setColumnWidth(9, 140);  // I
  sheet.setColumnWidth(10, 25);  // J (Margin)

  // -------------------------------------------------------------
  // HEADER BANNER UTAMA DASHBOARD
  // -------------------------------------------------------------
  sheet.getRange("B2:I2").merge()
    .setValue("🌲 TEMAN SATU JALAN — MOESLIM SPORT CLUB")
    .setFontFamily("Arial")
    .setFontSize(16)
    .setFontWeight("bold")
    .setFontColor("#84cc16")
    .setBackground("#0f281b")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(2, 38);

  sheet.getRange("B3:I3").merge()
    .setValue("DASHBOARD EKSEKUTIF: MONITORING REGISTRASI, ROSTER PETUALANG & KEUANGAN TRIP")
    .setFontFamily("Arial")
    .setFontSize(9)
    .setFontWeight("bold")
    .setFontColor("#cbd5e1")
    .setBackground("#15241b")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(3, 24);

  // -------------------------------------------------------------
  // KARTU METRIK KPI UTAMA (ROW 5 - 7)
  // -------------------------------------------------------------
  // Kartu 1: Total Petualang (B5:C7)
  buatKartuKpi(sheet, "B5:C7", "👥 TOTAL PETUALANG TERDAFTAR", "=COUNTA('👥 Data Peserta'!K4:K)", "Orang Petualang", "#f0fdf4", "#15803d", "0");
  
  // Kartu 2: Total Rombongan / Transaksi (D5:E7)
  buatKartuKpi(sheet, "D5:E7", "🏕️ TOTAL KELOMPOK / ROMBONGAN", "=IFERROR(COUNTA(UNIQUE(FILTER('👥 Data Peserta'!B4:B, '👥 Data Peserta'!B4:B<>\"\"))), 0)", "Rombongan", "#f0fdf4", "#15803d", "0");

  // Kartu 3: Total Kas Pembayaran Masuk (F5:G7)
  buatKartuKpi(sheet, "F5:G7", "💰 TOTAL DANA MASUK (KAS)", "=SUM('👥 Data Peserta'!G4:G)", "Pembayaran QRIS", "#ecfdf5", "#047857", '"Rp"#,##0');

  // Kartu 4: Sisa Piutang Pelunasan DP (H5:I7)
  buatKartuKpi(sheet, "H5:I7", "⏳ SISA PELUNASAN DP (H-7)", "=SUM('👥 Data Peserta'!H4:H)", "Wajib Lunas H-7", "#fffbeb", "#b45309", '"Rp"#,##0');

  // -------------------------------------------------------------
  // KARTU STATUS & DEMOGRAFI (ROW 9 - 11)
  // -------------------------------------------------------------
  // Kartu 5: Peserta Lunas
  buatKartuKpi(sheet, "B9:C11", "✅ STATUS: LUNAS 100%", "=COUNTIF('👥 Data Peserta'!I4:I, \"*LUNAS*\")", "Petualang Tuntas", "#f0fdf4", "#16a34a", "0");

  // Kartu 6: Menunggu Pelunasan (DP)
  buatKartuKpi(sheet, "D9:E11", "⚠️ MENUNGGU PELUNASAN DP", "=COUNTIF('👥 Data Peserta'!I4:I, \"*BELUM LUNAS*\")", "Perlu Follow-up H-7", "#fefce8", "#ca8a04", "0");

  // Kartu 7: Ikhwan
  buatKartuKpi(sheet, "F9:G11", "🥾 PETUALANG IKHWAN", "=COUNTIF('👥 Data Peserta'!M4:M, \"*Ikhwan*\")", "Laki-laki", "#f0f9ff", "#0284c7", "0");

  // Kartu 8: Akhwat
  buatKartuKpi(sheet, "H9:I11", "🌸 PETUALANG AKHWAT", "=COUNTIF('👥 Data Peserta'!M4:M, \"*Akhwat*\")", "Perempuan / Mahram", "#fff1f2", "#e11d48", "0");

  // -------------------------------------------------------------
  // TABEL REKAPITULASI (ROW 13+)
  // -------------------------------------------------------------
  // Judul Tabel Kiri: Rekap Edisi Event
  sheet.getRange("B13:E13").merge()
    .setValue("🗺️ REKAPITULASI BERDASARKAN EDISI EVENT")
    .setFontFamily("Arial").setFontSize(10).setFontWeight("bold").setFontColor("#ffffff").setBackground("#1e3a2b")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(13, 28);

  var subHeadersEvent = ["Edisi Kegiatan", "Peserta", "Status", "Dana Masuk (Rp)"];
  sheet.getRange("B14:E14").setValues([subHeadersEvent])
    .setFontFamily("Arial").setFontSize(9).setFontWeight("bold").setFontColor("#1e3a2b").setBackground("#dcfce7")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(14, 25);

  var eventRows = [
    ["Vol 6 — Curug Lewibumi", "=COUNTIF('👥 Data Peserta'!D4:D, \"*Vol 6*\")", "Aktif", "=SUMIF('👥 Data Peserta'!D4:D, \"*Vol 6*\", '👥 Data Peserta'!G4:G)"],
    ["Vol 7 — Curug Panjang", "=COUNTIF('👥 Data Peserta'!D4:D, \"*Vol 7*\")", "Edisi Utama", "=SUMIF('👥 Data Peserta'!D4:D, \"*Vol 7*\", '👥 Data Peserta'!G4:G)"],
    ["Total Keseluruhan", "=SUM(C15:C16)", "All Active", "=SUM(E15:E16)"]
  ];
  sheet.getRange("B15:E17").setValues(eventRows)
    .setFontFamily("Arial").setFontSize(9).setVerticalAlignment("middle");
  sheet.getRange("B15:B17").setHorizontalAlignment("left");
  sheet.getRange("C15:D17").setHorizontalAlignment("center");
  sheet.getRange("E15:E17").setHorizontalAlignment("right").setNumberFormat('"Rp"#,##0');
  sheet.getRange("B17:E17").setFontWeight("bold").setBackground("#f1f5f9");
  sheet.getRange("B13:E17").setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);

  // Judul Tabel Kanan: Rekap Kategori Paket
  sheet.getRange("G13:I13").merge()
    .setValue("🏷️ REKAPITULASI KATEGORI PAKET")
    .setFontFamily("Arial").setFontSize(10).setFontWeight("bold").setFontColor("#ffffff").setBackground("#1e3a2b")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  var subHeadersPkg = ["Kategori Paket", "Peserta", "Dana Terhimpun"];
  sheet.getRange("G14:I14").setValues([subHeadersPkg])
    .setFontFamily("Arial").setFontSize(9).setFontWeight("bold").setFontColor("#1e3a2b").setBackground("#dcfce7")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  var pkgRows = [
    ["Single (1 Orang)", "=COUNTIF('👥 Data Peserta'!E4:E, \"*Single*\")", "=SUMIF('👥 Data Peserta'!E4:E, \"*Single*\", '👥 Data Peserta'!G4:G)"],
    ["Couple (2 Orang)", "=COUNTIF('👥 Data Peserta'!E4:E, \"*Couple*\")", "=SUMIF('👥 Data Peserta'!E4:E, \"*Couple*\", '👥 Data Peserta'!G4:G)"],
    ["Little Family (3 Orang)", "=COUNTIF('👥 Data Peserta'!E4:E, \"*Little Family*\")", "=SUMIF('👥 Data Peserta'!E4:E, \"*Little Family*\", '👥 Data Peserta'!G4:G)"],
    ["Squad Family (4 Orang)", "=COUNTIF('👥 Data Peserta'!E4:E, \"*Squad Family*\")", "=SUMIF('👥 Data Peserta'!E4:E, \"*Squad Family*\", '👥 Data Peserta'!G4:G)"]
  ];
  sheet.getRange("G15:I18").setValues(pkgRows)
    .setFontFamily("Arial").setFontSize(9).setVerticalAlignment("middle");
  sheet.getRange("G15:G18").setHorizontalAlignment("left");
  sheet.getRange("H15:H18").setHorizontalAlignment("center");
  sheet.getRange("I15:I18").setHorizontalAlignment("right").setNumberFormat('"Rp"#,##0');
  sheet.getRange("G13:I18").setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);

  // -------------------------------------------------------------
  // TOMBOL NAVIGASI & FOOTER INFORMASI
  // -------------------------------------------------------------
  sheet.getRange("B20:I21").merge()
    .setValue("📋 LIHAT DATA RINCI PETUALANG: Buka tab '👥 Data Peserta' di bawah untuk mengecek data kontak, domisili, data medis, dan bukti transfer.\n" +
              "💰 MONITORING PELUNASAN: Buka tab '💰 Monitoring Pelunasan H-7' untuk memantau peserta DP dan mengirim pengingat WhatsApp.")
    .setFontFamily("Arial").setFontSize(8.5).setFontColor("#475569").setBackground("#f8fafc")
    .setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);
  sheet.getRange("B20:I21").setBorder(true, true, true, true, false, false, "#94a3b8", SpreadsheetApp.BorderStyle.DASHED);
}

// Helper untuk membuat kartu metrik KPI
function buatKartuKpi(sheet, a1Notation, title, formula, subtitle, bgColor, accentColor, numFormat) {
  var range = sheet.getRange(a1Notation);
  var coords = range.getSheet().getRange(a1Notation);
  var startR = coords.getRow();
  var startC = coords.getColumn();
  var numCols = coords.getNumColumns();

  // Row 1: Title
  sheet.getRange(startR, startC, 1, numCols).merge()
    .setValue(title)
    .setFontFamily("Arial").setFontSize(8.5).setFontWeight("bold").setFontColor(accentColor)
    .setBackground(bgColor).setHorizontalAlignment("center").setVerticalAlignment("middle");

  // Row 2: Value Formula
  sheet.getRange(startR + 1, startC, 1, numCols).merge()
    .setValue(formula)
    .setFontFamily("Arial").setFontSize(18).setFontWeight("bold").setFontColor("#0f172a")
    .setBackground(bgColor).setHorizontalAlignment("center").setVerticalAlignment("middle")
    .setNumberFormat(numFormat);

  // Row 3: Subtitle
  sheet.getRange(startR + 2, startC, 1, numCols).merge()
    .setValue(subtitle)
    .setFontFamily("Arial").setFontSize(7.5).setFontColor("#64748b")
    .setBackground(bgColor).setHorizontalAlignment("center").setVerticalAlignment("middle");

  // Set card border
  range.setBorder(true, true, true, true, false, false, accentColor, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
}

// =============================================================================
// 6. PEMBUATAN & STYLING TAB "💰 MONITORING PELUNASAN H-7"
// =============================================================================
function buatTabMonitoringDp(docInstance) {
  var doc = docInstance || SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "💰 Monitoring Pelunasan H-7";
  var sheet = doc.getSheetByName(sheetName);

  if (!sheet) {
    sheet = doc.insertSheet(sheetName);
  }

  sheet.clear();

  // Banner Header
  sheet.getRange("A1:H1").merge()
    .setValue("⏳ MONITORING & PENAGIHAN PELUNASAN DP 50% (H-7 KEBERANGKATAN)")
    .setFontFamily("Arial").setFontSize(12).setFontWeight("bold").setFontColor("#ffffff").setBackground("#92400e")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(1, 38);

  sheet.getRange("A2:H2").merge()
    .setValue("Daftar otomatis peserta yang memilih skema DP 50%. Gunakan kolom WhatsApp untuk langsung membuka chat WhatsApp pengingat pelunasan.")
    .setFontFamily("Arial").setFontSize(8.5).setFontColor("#fef3c7").setBackground("#b45309")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(2, 24);

  // Header Kolom
  var headers = [
    "No",
    "Kode Registrasi",
    "Nama PIC Rombongan",
    "No. WhatsApp PIC",
    "Edisi & Paket",
    "DP Masuk (Rp)",
    "Sisa Pelunasan (Rp)",
    "Link Kirim Pengingat WhatsApp"
  ];

  sheet.getRange(3, 1, 1, headers.length).setValues([headers])
    .setFontFamily("Arial").setFontSize(9.5).setFontWeight("bold").setFontColor("#ffffff").setBackground("#78350f")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(3, 32);

  // Lebar kolom
  var widths = [45, 140, 180, 140, 200, 130, 130, 220];
  for (var w = 0; w < widths.length; w++) {
    sheet.setColumnWidth(w + 1, widths[w]);
  }

  // Formula Otomatis mengambil data yang BELUM LUNAS dari sheet data
  // Menggunakan FILTER dinamis untuk mengekstrak hanya peserta berstatus BELUM LUNAS (H-7)
  var filterFormula = '=IFERROR(FILTER({\'👥 Data Peserta\'!B4:B, \'👥 Data Peserta\'!K4:K, \'👥 Data Peserta\'!O4:O, \'👥 Data Peserta\'!D4:D & " (" & \'👥 Data Peserta\'!E4:E & ")", \'👥 Data Peserta\'!G4:G, \'👥 Data Peserta\'!H4:H}, \'👥 Data Peserta\'!I4:I="BELUM LUNAS (H-7)", \'👥 Data Peserta\'!J4:J="Petualang 1 (PIC)"), "Alhamdulillah, belum ada tagihan DP yang tertunda.")';

  sheet.getRange("B4").setValue(filterFormula);
  sheet.getRange("A4:A50").setFormula('=IF(B4<>""; IF(ISNUMBER(SEARCH("Alhamdulillah"; B4)); ""; ROW()-3); "")');

  // Format Mata Uang
  sheet.getRange("F4:G50").setNumberFormat('"Rp"#,##0');
  sheet.getRange("A4:H50").setFontFamily("Arial").setFontSize(9).setVerticalAlignment("middle");
  sheet.getRange("A4:B50").setHorizontalAlignment("center");
  sheet.getRange("D4:D50").setHorizontalAlignment("center");
  sheet.getRange("F4:G50").setHorizontalAlignment("right");

  // Formula Kolom WhatsApp Link
  sheet.getRange("H4:H50").setFormula(
    '=IF(AND(D4<>""; D4<>"-"); HYPERLINK("https://wa.me/" & SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(D4; " "; ""); "-"; ""); "+"; ""); "\'"; ""); "📲 Kirim WA Pengingat Pelunasan"); "")'
  );
  sheet.getRange("H4:H50").setFontColor("#0284c7").setFontWeight("bold");

  sheet.setFrozenRows(3);
}

// =============================================================================
// 7. DATA SIMULASI / CONTOH UNTUK TESTING TAMPILAN
// =============================================================================
function isiDataSimulasi() {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = doc.getSheetByName("👥 Data Peserta");

  if (!sheet || sheet.getLastRow() < 3) {
    setupSpreadsheetLengkap();
    sheet = doc.getSheetByName("👥 Data Peserta");
  }

  // Siapkan data simulasi rombongan
  var sampleRows = [
    // Rombongan 1: Vol 7 Lovetrail Couple (DP 50%)
    [
      1, "TMN1JLN-V7-1011", new Date(), "Vol 7 — Curug Panjang", "Lovetrail Couple (400K)", "DP (50%)", 200000, 200000, "BELUM LUNAS (H-7)",
      "Petualang 1 (PIC)", "Ahmad Fauzi", "Suami / Ayah (Ketua)", "Ikhwan", "Dewasa (32 Th)", "'081288889999", "ahmad.fauzi@gmail.com", "-",
      "Jakarta Selatan", "Kendaraan Pribadi", "Langsung ke Bukit Waruwangi (06.00 WIB)", "Pernah • Rutin", "Siti Rahma", "'081299998888", "struk-dp-fauzi.jpg"
    ],
    [
      2, "TMN1JLN-V7-1011", new Date(), "Vol 7 — Curug Panjang", "Lovetrail Couple (400K)", "DP (50%)", 0, 0, "BELUM LUNAS (H-7)",
      "Petualang 2", "Siti Rahma", "Istri / Ibu", "Akhwat", "Dewasa (29 Th)", "'081299998888", "-", "Alergi Dingin Ringan",
      "Jakarta Selatan", "Kendaraan Pribadi", "Langsung ke Bukit Waruwangi (06.00 WIB)", "Pernah • Rutin", "Ahmad Fauzi", "'081288889999", "struk-dp-fauzi.jpg"
    ],
    // Rombongan 2: Vol 7 Lovetrail Single (Lunas 100%)
    [
      3, "TMN1JLN-V7-2022", new Date(), "Vol 7 — Curug Panjang", "Lovetrail Single (200K)", "Lunas (100%)", 200000, 0, "LUNAS",
      "Petualang 1 (PIC)", "Muhammad Rizky", "Ikhwan (Ketua)", "Ikhwan", "Pemuda (24 Th)", "'085711223344", "rizky.adv@gmail.com", "-",
      "Tangerang", "Konvoi Tol Cilegon", "Konvoi Rest Area Tol Cilegon Timur (04.45 WIB)", "Sering Trekking • Rutin", "Bapak Hendra", "'081233445566", "bukti-lunas-rizky.png"
    ],
    // Rombongan 3: Vol 6 Lovetrail Squad Family (Lunas 100%)
    [
      4, "TMN1JLN-V6-3033", new Date(), "Vol 6 — Curug Lewibumi", "Lovetrail Squad Family (630K)", "Lunas (100%)", 630000, 0, "LUNAS",
      "Petualang 1 (PIC)", "Hendrawan Pratama", "Suami / Ayah (Ketua)", "Ikhwan", "Dewasa (38 Th)", "'081377889900", "hendra.pratama@outlook.com", "-",
      "Serang, Banten", "Kendaraan Pribadi", "Kadubereum (06.00 WIB)", "Pemula • Cukup Aktif", "Rina Marlina", "'081366778899", "transfer-bca-hendra.pdf"
    ]
  ];

  var startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, sampleRows.length, sampleRows[0].length).setValues(sampleRows);
  formatDataRows(sheet, startRow, sampleRows.length);

  // Perbarui juga tab monitoring
  buatTabMonitoringDp(doc);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "3 Data rombongan simulasi berhasil dimasukkan! Silakan cek tab Dashboard & Monitoring.",
    "🧪 Simulasi Sukses",
    4
  );
}

// Helper ekstraksi angka dari format Rupiah
function parseNominal(val) {
  if (typeof val === "number") return val;
  if (!val) return 0;
  var digits = val.toString().replace(/[^0-9]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}
