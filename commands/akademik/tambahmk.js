const fs = require('fs');

module.exports = {
    name: 'tambahmk',
    category: 'akademik',
    async execute(sock, msg, args, config) {
        const from = msg.key.remoteJid;
        const [nama, hari, jam, dosen, ruang] = args.join(' ').split('|');

        if (!nama || !hari || !jam || !dosen || !ruang) {
            return sock.sendMessage(from, { 
                text: `❌ *Format Salah!*\n\nGunakan format:\n\`.tambahmk NamaMK|Hari|Jam|Dosen1;Dosen2|Ruangan\`` 
            });
        }

        const dbPath = './database/academic.json';
        let db = JSON.parse(fs.readFileSync(dbPath));

        // Pecah daftar dosen menggunakan titik koma (;)
        const listDosen = dosen.split(';').map(d => d.trim());

        const newMK = {
            id: Date.now(),
            nama: nama.trim(),
            hari: hari.trim(),
            jam: jam.trim(),
            dosen: listDosen,
            ruang: ruang.trim()
        };

        db.mk.push(newMK);
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        const response = `✅ *MATA KULIAH BERHASIL DITAMBAH*\n\n` +
                         `📚 MK: ${newMK.nama}\n` +
                         `📅 Jadwal: ${newMK.hari}, ${newMK.jam}\n` +
                         `👨‍🏫 Dosen:\n - ${newMK.dosen.join('\n - ')}\n` +
                         `🏫 Ruangan: ${newMK.ruang}`;

        await sock.sendMessage(from, { text: response });
    }
};