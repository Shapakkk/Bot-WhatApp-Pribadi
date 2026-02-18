const fs = require('fs');

module.exports = {
    name: 'editmk',
    category: 'akademik',
    async execute(sock, msg, args, config) {
        const from = msg.key.remoteJid;
        const [target, nNama, nHari, nJam, nDosen, nRuang] = args.join(' ').split('|');

        if (!target) {
            return sock.sendMessage(from, { 
                text: `❌ *Format Edit MK Salah!*\n\nFormat: \`.editmk [No/Nama]|NamaBaru|Hari|Jam|Dosen|Ruang\`\n\n_Kosongkan bagian yang tidak ingin diubah._` 
            });
        }

        const dbPath = './database/academic.json';
        let db = JSON.parse(fs.readFileSync(dbPath));
        
        let index = -1;
        // Cari berdasarkan Nomor Urut atau Nama
        if (!isNaN(target)) {
            index = parseInt(target) - 1;
        } else {
            index = db.mk.findIndex(x => x.nama.toLowerCase() === target.toLowerCase().trim());
        }

        if (index === -1 || !db.mk[index]) {
            return sock.sendMessage(from, { text: '❌ Mata Kuliah tidak ditemukan dalam daftar.' });
        }

        const oldName = db.mk[index].nama;

        // Update data (Jika input kosong, pakai data lama)
        db.mk[index].nama = nNama ? nNama.trim() : db.mk[index].nama;
        db.mk[index].hari = nHari ? nHari.trim() : db.mk[index].hari;
        db.mk[index].jam = nJam ? nJam.trim() : db.mk[index].jam;
        db.mk[index].ruang = nRuang ? nRuang.trim() : db.mk[index].ruang;
        
        if (nDosen) {
            db.mk[index].dosen = nDosen.split(';').map(d => d.trim());
        }

        // Jika Nama MK berubah, update juga nama MK di daftar tugas yang terkait
        if (nNama && nNama.trim() !== oldName) {
            db.tugas.forEach(t => {
                if (t.mk === oldName) t.mk = nNama.trim();
            });
        }

        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        const res = `✅ *MK BERHASIL DIUPDATE*\n\n` +
                    `📚 MK: ${db.mk[index].nama}\n` +
                    `📅 Jadwal: ${db.mk[index].hari}, ${db.mk[index].jam}\n` +
                    `👨‍🏫 Dosen: ${db.mk[index].dosen.join('; ')}\n` +
                    `🏫 Ruang: ${db.mk[index].ruang}`;

        await sock.sendMessage(from, { text: res });
    }
};