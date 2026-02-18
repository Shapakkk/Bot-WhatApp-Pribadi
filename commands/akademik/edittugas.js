const fs = require('fs');

module.exports = {
    name: 'edittugas',
    category: 'akademik',
    async execute(sock, msg, args, config) {
        const from = msg.key.remoteJid;
        const [target, nNama, nTipe, nDlDate, nMode, nTime] = args.join(' ').split('|');

        if (!target) {
            return sock.sendMessage(from, { 
                text: `❌ *Format Edit Tugas Salah!*\n\nFormat:\n\`.edittugas [No/Nama]|NamaBaru|Tipe|Deadline|Mode|JamNotif\`` 
            });
        }

        const dbPath = './database/academic.json';
        let db = JSON.parse(fs.readFileSync(dbPath));

        let index = -1;
        // Cari berdasarkan Nomor Urut atau Nama Tugas
        if (!isNaN(target)) {
            index = parseInt(target) - 1;
        } else {
            index = db.tugas.findIndex(x => x.nama.toLowerCase() === target.toLowerCase().trim());
        }

        if (index === -1 || !db.tugas[index]) {
            return sock.sendMessage(from, { text: '❌ Tugas tidak ditemukan dalam daftar.' });
        }

        // Update data (Jika input kosong/tidak diisi, pakai data lama)
        db.tugas[index].nama = nNama ? nNama.trim() : db.tugas[index].nama;
        db.tugas[index].tipe = nTipe ? nTipe.trim() : db.tugas[index].tipe;
        db.tugas[index].deadlineDate = nDlDate ? nDlDate.trim() : db.tugas[index].deadlineDate;
        db.tugas[index].notifMode = nMode ? nMode.trim() : db.tugas[index].notifMode;
        db.tugas[index].notifTime = nTime ? nTime.trim() : db.tugas[index].notifTime;

        // Reset status notifikasi terakhir jika waktu/mode berubah agar diingatkan lagi
        if (nMode || nTime || nDlDate) {
            db.tugas[index].lastNotified = '';
        }

        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        let mde = db.tugas[index].notifMode === '1' ? 'Tiap Hari' : db.tugas[index].notifMode === '2' ? '2 Hari Sekali' : 'H-1';

        const res = `✅ *TUGAS BERHASIL DIUPDATE*\n\n` +
                    `📝 Tugas: ${db.tugas[index].nama}\n` +
                    `📘 MK: ${db.tugas[index].mk}\n` +
                    `📅 Deadline: ${db.tugas[index].deadlineDate}\n` +
                    `🔔 Notif: ${mde} (${db.tugas[index].notifTime} WITA)`;

        await sock.sendMessage(from, { text: res });
    }
};