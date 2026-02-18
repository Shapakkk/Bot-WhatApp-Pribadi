const fs = require('fs');
const moment = require('moment-timezone');
const axios = require('axios');

module.exports = {
    name: 'pemasukan',
    category: 'ekonomi',
    async execute(sock, msg, args, config) {
        const from = msg.key.remoteJid;
        const botNumber = sock.user.id.split(':')[0];

        if (args.length === 0) {
            let menu = `💰 *CATAT PEMASUKAN*\nFormat: \`.pemasukan nominal|kategori|dompet|ket\`\n\n`;
            (config.listDompet || ["Tunai", "Bank", "E-Wallet"]).forEach(d => {
                menu += `🔹 *${d.toUpperCase()}*\nhttps://wa.me/${botNumber}?text=${config.prefix}pemasukan%200|Kategori|${d}|Keterangan\n\n`;
            });
            return await sock.sendMessage(from, { text: menu });
        }

        const [nom, kat, dom, ket] = args.join(' ').split('|');
        if (!nom || isNaN(nom) || parseInt(nom) <= 0 || !dom) {
            return sock.sendMessage(from, { text: "❌ Format: `.pemasukan nominal|kategori|dompet|ket`" });
        }

        const dbPath = './database/finance.json';
        const db = JSON.parse(fs.readFileSync(dbPath));
        const now = moment().tz(config.timezone).format('dddd, DD/MM/YYYY | HH:mm');
        
        const data = {
            id: Date.now(),
            tipe: 'IN',
            nominal: parseInt(nom),
            kategori: kat,
            dompet: dom,
            keterangan: ket || '-',
            waktu: now + ' WITA'
        };

        db.push(data);
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        const teksLaporan = `💰 *LAPORAN PEMASUKAN BARU*\n` +
                            `──────────────────\n` +
                            `🆔 *ID:* \`${data.id}\`\n` +
                            `💵 *Nominal:* Rp ${data.nominal.toLocaleString()}\n` +
                            `📂 *Kategori:* ${data.kategori}\n` +
                            `💳 *Dompet:* ${data.dompet}\n` +
                            `📝 *Keterangan:* ${data.keterangan}\n` +
                            `📅 *Waktu:* ${data.waktu}\n` +
                            `──────────────────\n` +
                            `_Data berhasil disimpan._`;

        // 1. Kirim Laporan ke GRUP (Config)
        if (config.targetGroupId) {
            await sock.sendMessage(config.targetGroupId, { text: teksLaporan }).catch(e => console.log(e));
        }

        // 2. Jika user kirim dari grup lain/pribadi, beri notif sukses
        if (from !== config.targetGroupId) {
            await sock.sendMessage(from, { text: "✅ *Tercatat!* Laporan sudah dikirim ke grup log." });
        }

        // 3. Discord Webhook
        if (config.discord.webhookPemasukan) {
            axios.post(config.discord.webhookPemasukan, { content: `**[INCOME]**\n${teksLaporan.replace(/\*/g, '')}` }).catch(() => {});
        }
    }
};