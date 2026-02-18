const fs = require('fs');

module.exports = {
    name: 'setgrup',
    category: 'general',
    async execute(sock, msg, args, config) {
        const from = msg.key.remoteJid;

        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ Perintah ini cuma bisa dipake di dalem grup, Bre!" });
        }

        try {
            // Update config di memori dan file
            config.targetGroupId = from;
            fs.writeFileSync('./config.json', JSON.stringify(config, null, 4));

            const response = `✅ *GRUP LOG BERHASIL DISIAPKAN*\n\n` +
                             `📌 *Nama Grup:* ${msg.pushName || 'Grup Catat'}\n` +
                             `🆔 *ID Grup:* \`${from}\`\n\n` +
                             `Mulai sekarang, semua laporan keuangan bakal dikirim ke sini.`;

            await sock.sendMessage(from, { text: response });
        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: "❌ Gagal menyimpan konfigurasi grup." });
        }
    }
};