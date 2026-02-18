# ⚡ Bot WhatsApp Pribadi

Project bot WhatsApp personal yang dibangun dengan Node.js untuk membantu manajemen aktivitas harian secara otomatis.

---

## 🛠 Tech Stack
* **Language:** [Node.js](https://nodejs.org/)
* **Library:** [Baileys](https://github.com/WhiskeySockets/Baileys) (Multi-device)
* **Automation:** PM2 Support (`ecosystem.config.js`)
* **Scheduler:** Node-schedule untuk manajemen tugas.

---

## 📂 Project Structure
* `commands/akademik/` - Manajemen tugas kuliah & mata kuliah.
* `commands/ekonomi/` - Pencatatan keuangan (pemasukan & pengeluaran).
* `commands/general/` - Fitur umum dan utilitas bot.
* `lib/` - Modul pendukung (Scheduler, database handler, dll).

---

## 📜 Changelog

### [0.1] - 2026-02-18
#### Added
- Menambahkan command baru: `uptime` (untuk mengecek durasi aktif bot).

#### Fixed
- **Ekonomi Module:** Perbaikan logika pada command `pemasukan` dan `pengeluaran` agar pencatatan saldo lebih akurat.

---

## 🛡 License
Personal Use Only.