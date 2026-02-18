const fs = require('fs');

module.exports = {
    name: 'confirmtugas',
    category: 'akademik',
    async execute(sock, msg, args, config) {
        const from = msg.key.remoteJid;
        const target = args.join(' ').trim();

        if (!target) return sock.sendMessage(from, { text: '❌ Masukkan nomor atau nama tugas!' });

        const dbPath = './database/academic.json';
        let db = JSON.parse(fs.readFileSync(dbPath));
        
        let index = -1;
        if (!isNaN(target)) {
            index = parseInt(target) - 1;
        } else {
            index = db.tugas.findIndex(x => x.nama.toLowerCase() === target.toLowerCase());
        }

        if (index === -1 || !db.tugas[index]) return sock.sendMessage(from, { text: '❌ Tugas tidak ditemukan.' });

        db.tugas[index].status = 'SELESAI';
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        await sock.sendMessage(from, { text: `🎉 Tugas *${db.tugas[index].nama}* ditandai SELESAI!` });
    }
};