const fs = require('fs');

module.exports = {
    name: 'hapustugas',
    category: 'akademik',
    async execute(sock, msg, args, config) {
        const from = msg.key.remoteJid;
        const input = args.join(' ').trim();

        if (!input) return sock.sendMessage(from, { text: `❌ Masukkan nomor atau nama tugas!` });

        const dbPath = './database/academic.json';
        let db = JSON.parse(fs.readFileSync(dbPath));

        let indexHapus = -1;
        let namaTgs = "";

        if (!isNaN(input)) {
            const noUrut = parseInt(input) - 1;
            if (db.tugas[noUrut]) {
                indexHapus = noUrut;
                namaTgs = db.tugas[noUrut].nama;
            }
        } else {
            indexHapus = db.tugas.findIndex(x => x.nama.toLowerCase() === input.toLowerCase());
            if (indexHapus !== -1) namaTgs = db.tugas[indexHapus].nama;
        }

        if (indexHapus === -1) return sock.sendMessage(from, { text: `❌ Tugas tidak ditemukan.` });

        db.tugas.splice(indexHapus, 1);
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        await sock.sendMessage(from, { text: `🗑️ Berhasil menghapus tugas: *${namaTgs}*` });
    }
};