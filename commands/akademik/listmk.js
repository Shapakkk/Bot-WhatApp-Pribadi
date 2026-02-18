const fs = require('fs');

module.exports = {
    name: 'listmk',
    category: 'akademik',
    async execute(sock, msg, args, config) {
        const from = msg.key.remoteJid;
        const dbPath = './database/academic.json';
        const db = JSON.parse(fs.readFileSync(dbPath));

        if (db.mk.length === 0) return sock.sendMessage(from, { text: '📭 Belum ada Mata Kuliah yang terdaftar, Bre.' });

        let teks = `📚 *DAFTAR MATA KULIAH LO*\n\n`;
        db.mk.forEach((m, i) => {
            teks += `${i + 1}. *${m.nama}*\n`;
            teks += `   ⏰ Jadwal: ${m.hari}, ${m.jam}\n`;
            teks += `   🏫 Ruang: ${m.ruang}\n`;
            teks += `   👨‍🏫 Dosen: ${m.dosen.join('; ')}\n\n`;
        });

        await sock.sendMessage(from, { text: teks });
    }
};