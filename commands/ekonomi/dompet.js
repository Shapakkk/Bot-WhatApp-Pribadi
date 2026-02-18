const fs = require('fs');

module.exports = {
    name: 'dompet',
    category: 'ekonomi',
    async execute(sock, msg, args, config) {
        const db = JSON.parse(fs.readFileSync('./database/finance.json'));
        const dompetList = config.listDompet || ["Tunai"];
        let laporan = `💳 *STATUS DOMPET LO*\n\n`;
        let totalSemua = 0;

        dompetList.forEach(d => {
            const masuk = db.filter(x => x.dompet === d && x.tipe === 'IN').reduce((a, b) => a + b.nominal, 0);
            const keluar = db.filter(x => x.dompet === d && x.tipe === 'OUT').reduce((a, b) => a + b.nominal, 0);
            const saldo = masuk - keluar;
            totalSemua += saldo;
            laporan += `*${d.toUpperCase()}*\n ├ Masuk: ${masuk.toLocaleString()}\n ├ Keluar: ${keluar.toLocaleString()}\n └ *Saldo: Rp ${saldo.toLocaleString()}*\n\n`;
        });

        laporan += `────────────────\n💰 *TOTAL SALDO: Rp ${totalSemua.toLocaleString()}*`;
        await sock.sendMessage(msg.key.remoteJid, { text: laporan });
    }
};