# ⚡ Bot WhatsApp Pribadi (v0.2)

Project bot WhatsApp personal yang dibangun dengan Node.js untuk membantu manajemen aktivitas harian (Ekonomi & Akademik) secara otomatis dan terintegrasi dengan Discord.

---

## 🛠 Tech Stack
* **Language:** [Node.js](https://nodejs.org/) (v18+)
* **Library:** [Baileys v7](https://github.com/WhiskeySockets/Baileys) (Multi-device)
* **Automation:** PM2 Support (`ecosystem.config.js`)
* **Scheduler:** [Node-Cron](https://www.npmjs.com/package/node-cron) untuk manajemen tugas & backup.
* **Logging:** [Pino](https://www.npmjs.com/package/pino) (Silent Mode).

---

## 📂 Project Structure
* `commands/akademik/` - Manajemen Mata Kuliah & Tugas (Pengingat otomatis).
* `commands/ekonomi/` - Pencatatan Keuangan, Dompet, & Transaksi.
* `commands/owner/` - Fitur kontrol penuh (Set Config, Backup, Test).
* `commands/general/` - Utilitas bot (Help, Uptime, SetGroup).
* `lib/` - Otak sistem (Scheduler & Backup Engine).
* `database/` - Local JSON Database (Finance & Academic).

---

## 📜 Changelog

### [0.2] - 2026-02-21
#### Added
- **Core Engine:** Implementasi **Command Aliases** (satu fitur bisa banyak nama perintah).
- **Core Engine:** Sistem **Pairing Code** untuk login tanpa scan QR.
- **Core Engine:** **Auto-Read** fitur (bisa dinyala-matikan via config).
- **Core Engine:** Log terminal super bersih (**Silent Logging**) menggunakan level fatal.
- **Group Fix:** Perbaikan **Body Parser** agar bot bisa merespon di Grup (Bot wajib Admin).
- **Group Fix:** Fitur **Auto-Reply/Quoted** agar pesan bot selalu ngetag pengirim (Anti-delay).
- **Ekonomi:** **Sistem Dompet** (Tunai, Bank, E-Wallet) dengan saldo terpisah.
- **Ekonomi:** Fitur **Hapus Transaksi** via ID unik atau reset total (`all`).
- **Ekonomi:** Laporan terpusat: 1 Chat Pribadi + 1 Grup WA Log + Webhook Discord.
- **Akademik:** Fitur **Pilih Nomor** (Input MK/Tugas cukup pake angka urutan, gak perlu ngetik nama panjang).
- **Akademik:** Fitur **Jam Kuliah** dan pemisah dosen menggunakan `;` (aman untuk gelar akademik).
- **Akademik:** **Custom Deadline** (Format DD-MM-YYYY) untuk ketepatan waktu pengingat.
- **Akademik:** Fitur **Auto-List** pada perintah `.confirmtugas` (langsung nampilin yang pending).
- **Owner Fitur:** Command `.set` untuk mengubah `config.json` langsung via WhatsApp chat.
- **Owner Fitur:** **Auto Backup** database & config ke Discord setiap 6 jam.
- **Owner Fitur:** Command `.testnotif` untuk simulasi pengiriman reminder tugas ke WA & Discord.
- **Monitoring:** Perbaikan `.uptime` yang kini mencakup **Ping (ms)**, **Suhu CPU** (STB Linux), dan beban RAM.
- **General:** Command `.setgrup` untuk menentukan grup laporan secara otomatis tanpa copas ID.

#### Fixed
- **I/O Performance:** Migrasi dari `readFileSync` ke `fs.promises` (Async) untuk mencegah bot hang/lag saat menulis database besar.
- **Scheduler Fix:** Perbaikan bug "missed execution" pada cron job pengingat.
- **Discord Fix:** Perbaikan bug webhook yang sering tidak mengirim log pengeluaran.
- **UI/UX:** Re-format tampilan laporan di WhatsApp agar rapi dengan emoji dan pembatas (simetris dengan Discord).

---

### [0.1] - 2026-02-18
#### Added
- Menambahkan command baru: `uptime` (untuk mengecek durasi aktif bot).
- Fitur dasar Pemasukan & Pengeluaran.
- Fitur dasar Manajemen Mata Kuliah.

#### Fixed
- **Ekonomi Module:** Perbaikan logika pada command `pemasukan` dan `pengeluaran` agar pencatatan saldo lebih akurat.

---

## 🛡 License
Personal Use Only.