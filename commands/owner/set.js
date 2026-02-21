const fs = require('fs').promises;

module.exports = {
    name: 'set',
    category: 'owner',
    async execute(sock, msg, args, config, reply) {
        // 1. Cek Pengecekan Owner
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender.includes(config.ownerNumber.split('@')[0]);

        if (!isOwner) return reply("❌ Khusus Owner, Bre!");

        // 2. Jika cuma ngetik .set (tanpa argumen), tampilin LIST CONFIG
        if (args.length === 0) {
            let listConfig = `⚙️ *DAFTAR CONFIG SAAT INI*\n\n`;

            for (let key in config) {
                // Jika isinya object (seperti kategori discord)
                if (typeof config[key] === 'object' && !Array.isArray(config[key])) {
                    listConfig += `*── [ ${key.toUpperCase()} ] ──*\n`;
                    for (let subKey in config[key]) {
                        const val = config[key][subKey] || '_(kosong)_';
                        // Biar gak kepanjangan di chat, kalau URL dipotong dikit
                        const displayVal = val.length > 40 ? val.substring(0, 37) + '...' : val;
                        listConfig += `🔹 *${key}.${subKey}*\n   └ \`${displayVal}\`\n`;
                    }
                    listConfig += `\n`;
                } else {
                    // Jika key biasa (string/boolean/array)
                    const val = config[key];
                    listConfig += `🔸 *${key}*\n   └ \`${Array.isArray(val) ? val.join(', ') : val}\`\n`;
                }
            }

            listConfig += `──────────────────\n`;
            listConfig += `📝 *Cara Ubah:* \`.set key|value\`\n`;
            listConfig += `💡 *Contoh:* \`.set botName|Shapak Pro\``;

            return await reply(listConfig);
        }

        // 3. Logika Proses Perubahan Config
        const input = args.join(' ');
        const [key, valRaw] = input.split('|');

        if (!key || valRaw === undefined) {
            return reply(`⚠️ *Format Salah!*\nGunakan: \`.set key|value\`\n\nKetik \`.set\` saja untuk melihat daftar key yang tersedia.`);
        }

        let val = valRaw.trim();
        
        // Konversi tipe data otomatis
        if (val.toLowerCase() === 'true') val = true;
        else if (val.toLowerCase() === 'false') val = false;
        
        try {
            // Logika untuk nested key (pakai titik, misal: discord.webhookBackup)
            if (key.includes('.')) {
                const [k1, k2] = key.split('.');
                if (config[k1] && config[k1].hasOwnProperty(k2)) {
                    config[k1][k2] = val;
                } else {
                    return reply(`❌ Key *${key}* tidak ditemukan di dalam kategori ${k1}.`);
                }
            } else {
                // Logika untuk key utama
                if (config.hasOwnProperty(key)) {
                    // Khusus untuk listDompet, kita ubah string jadi Array
                    if (key === 'listDompet') {
                        config[key] = val.split(',').map(d => d.trim());
                    } else {
                        config[key] = val;
                    }
                } else {
                    return reply(`❌ Key *${key}* tidak ditemukan di konfigurasi utama.`);
                }
            }

            // Simpan perubahan ke file config.json
            await fs.writeFile('./config.json', JSON.stringify(config, null, 4));
            
            await reply(`✅ *Berhasil Diupdate!*\n\nKey: *${key}*\nSekarang diatur ke: \`${val}\``);

        } catch (e) {
            console.error(e);
            await reply(`❌ *Gagal menyimpan perubahan:* ${e.message}`);
        }
    }
};