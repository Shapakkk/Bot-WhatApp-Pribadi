const fs = require('fs');

module.exports = {
    name: 'listtugas',
    category: 'akademik',
    async execute(sock, msg, args, config) {
        const from = msg.key.remoteJid;
        const db = JSON.parse(fs.readFileSync('./database/academic.json'));

        if (db.tugas.length === 0) return sock.sendMessage(from, { text: '📭 Belum ada tugas.' });

        let teks = `📝 *DAFTAR TUGAS KULIAH*\n\n`;
        let pending = db.tugas.filter(t => t.status === 'PENDING');

        pending.forEach((t, i) => {
            let mde = t.notifMode === '1' ? 'Tiap Hari' : t.notifMode === '2' ? '2 Hari Sekali' : 'H-1';
            teks += `${i + 1}. *${t.nama}*\n`;
            teks += `   📘 MK: ${t.mk}\n`;
            teks += `   📅 Deadline: ${t.deadlineDate}\n`;
            teks += `   🔔 Notif: ${mde} (${t.notifTime} WITA)\n\n`;
        });

        if (pending.length === 0) teks += `✅ Semua tugas sudah selesai!`;

        await sock.sendMessage(from, { text: teks });
    }
};