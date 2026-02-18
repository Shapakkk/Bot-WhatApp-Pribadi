const fs = require('fs');

module.exports = {
    name: 'hapusfinance',
    category: 'ekonomi',
    async execute(sock, msg, args, config) {
        const from = msg.key.remoteJid;
        const target = args[0];

        if (!target) return sock.sendMessage(from, { text: `Contoh:\n.hapusfinance [ID_DATA]\n.hapusfinance all` });

        let db = JSON.parse(fs.readFileSync('./database/finance.json'));

        if (target === 'all') {
            fs.writeFileSync('./database/finance.json', '[]');
            return sock.sendMessage(from, { text: "🗑️ Semua data keuangan berhasil dihapus bersih!" });
        }

        const initialLength = db.length;
        db = db.filter(x => x.id.toString() !== target);

        if (db.length === initialLength) {
            return sock.sendMessage(from, { text: "❌ ID tidak ditemukan, Bre." });
        }

        fs.writeFileSync('./database/finance.json', JSON.stringify(db, null, 2));
        await sock.sendMessage(from, { text: `✅ Data dengan ID ${target} berhasil dihapus.` });
    }
};