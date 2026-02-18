const fs = require('fs');

module.exports = {
    name: 'tambahtugas',
    category: 'akademik',
    async execute(sock, msg, args, config) {
        const from = msg.key.remoteJid;
        const input = args.join(' ').split('|');
        
        // Parsing Input
        const mkIndex = input[0]?.trim();
        const nama = input[1]?.trim();
        const tipe = input[2]?.trim();
        const dlDate = input[3]?.trim(); // Format: DD-MM-YYYY
        const mode = input[4]?.trim(); // 1, 2, atau 3
        const jamNotif = input[5]?.trim(); // HH:mm

        if (!jamNotif) {
            let help = `❌ *Format Tambah Tugas Salah!*\n\n`;
            help += `Format: \`.tambahtugas NoMK|Nama|Tipe|Deadline|Mode|JamNotif\`\n\n`;
            help += `*Opsi Mode:* \n1 = Tiap Hari\n2 = 2 Hari Sekali\n3 = H-1 Saja\n\n`;
            help += `*Contoh:* \`.tambahtugas 1|Laporan|Individu|20-02-2026|1|07:00\``;
            return sock.sendMessage(from, { text: help });
        }

        const dbPath = './database/academic.json';
        let db = JSON.parse(fs.readFileSync(dbPath));

        const mk = db.mk[parseInt(mkIndex) - 1];
        if (!mk) return sock.sendMessage(from, { text: "❌ Nomor MK tidak ditemukan di .listmk" });

        const newTgs = {
            id: Date.now(),
            mk: mk.nama,
            nama: nama,
            tipe: tipe,
            deadlineDate: dlDate, // Tanggal Pasti (Bisa di-custom sesuka user)
            notifMode: mode,
            notifTime: jamNotif,
            lastNotified: '',
            status: 'PENDING'
        };

        db.tugas.push(newTgs);
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        const res = `✅ *TUGAS BERHASIL DICATAT*\n\n` +
                    `📘 MK: ${newTgs.mk}\n` +
                    `📝 Tugas: ${newTgs.nama}\n` +
                    `📅 Deadline: ${newTgs.deadlineDate}\n` +
                    `🔔 Notif: Mode ${mode} jam ${jamNotif} WITA`;

        await sock.sendMessage(from, { text: res });
    }
};