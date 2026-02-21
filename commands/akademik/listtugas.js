const fs = require('fs').promises;

module.exports = {
    name: 'listtugas',
    aliases: ['cektugas'], // Tambahan Alias
    category: 'akademik',
    async execute(sock, msg, args, config, reply) {
        try {
            const db = JSON.parse(await fs.readFile('./database/academic.json', 'utf8'));

            if (db.tugas.length === 0) return reply('📭 Belum ada tugas yang dicatat.');

            let teks = `📝 *DAFTAR TUGAS KULIAH*\n\n`;
            let pending = db.tugas.filter(t => t.status === 'PENDING');

            if (pending.length === 0) {
                teks += `✅ *Semua tugas sudah selesai!*`;
            } else {
                pending.forEach((t, i) => {
                    let mde = t.notifMode === '1' ? 'Tiap Hari' : t.notifMode === '2' ? '2 Hari Sekali' : 'H-1';
                    teks += `${i + 1}. *${t.nama}*\n`;
                    teks += `   📘 MK: ${t.mk}\n`;
                    teks += `   📅 DL: ${t.deadlineDate}\n`;
                    teks += `   🔔 Notif: ${mde} (${t.notifTime} WITA)\n\n`;
                });
            }

            await reply(teks);
        } catch (e) {
            await reply("❌ Gagal mengambil daftar tugas.");
        }
    }
};