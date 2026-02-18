const fs = require('fs');

module.exports = {
    name: 'hapusmk',
    category: 'akademik',
    async execute(sock, msg, args, config) {
        const from = msg.key.remoteJid;
        const input = args.join(' ').trim();

        try {
            // 1. Cek jika tidak ada input
            if (!input) {
                return sock.sendMessage(from, { 
                    text: `⚠️ *Cara Hapus MK*\n\nKetik: \`.hapusmk [Nomor/Nama]\` \n\nContoh:\n.hapusmk 1\n.hapusmk BAHASA INDONESIA` 
                });
            }

            const dbPath = './database/academic.json';
            
            // 2. Pastikan file database ada
            if (!fs.existsSync(dbPath)) {
                return sock.sendMessage(from, { text: '❌ Database akademik tidak ditemukan.' });
            }

            let db = JSON.parse(fs.readFileSync(dbPath));

            if (!db.mk || db.mk.length === 0) {
                return sock.sendMessage(from, { text: '📭 Memang nggak ada MK yang terdaftar, Bre.' });
            }

            let indexHapus = -1;
            let namaTerhapus = "";

            // 3. Cek apakah input itu ANGKA (Nomor urut)
            if (!isNaN(input) && input !== "") {
                const noUrut = parseInt(input) - 1;
                if (db.mk[noUrut]) {
                    indexHapus = noUrut;
                    namaTerhapus = db.mk[noUrut].nama;
                }
            } else {
                // 4. Cari berdasarkan NAMA
                indexHapus = db.mk.findIndex(x => x.nama.toLowerCase() === input.toLowerCase());
                if (indexHapus !== -1) {
                    namaTerhapus = db.mk[indexHapus].nama;
                }
            }

            // 5. Jika tidak ditemukan
            if (indexHapus === -1) {
                return sock.sendMessage(from, { text: `❌ MK *${input}* tidak ditemukan dalam daftar.` });
            }

            // 6. Proses Hapus
            db.mk.splice(indexHapus, 1);
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            await sock.sendMessage(from, { text: `🗑️ Berhasil menghapus MK: *${namaTerhapus}*` });

        } catch (err) {
            console.error('Error hapusmk:', err);
            await sock.sendMessage(from, { text: '❌ Terjadi error internal saat menghapus MK.' });
        }
    }
};