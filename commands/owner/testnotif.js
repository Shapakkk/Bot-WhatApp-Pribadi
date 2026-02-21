const fs = require('fs').promises;
const axios = require('axios');
const moment = require('moment-timezone');

module.exports = {
    name: 'testnotif',
    category: 'owner',
    async execute(sock, msg, args, config, reply) {
        // 1. Validasi Owner
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender.includes(config.ownerNumber.split('@')[0]);

        if (!isOwner) return reply("❌ Khusus Owner, Bre!");

        try {
            await reply("🧪 *Memulai Simulasi Notifikasi Semua Tugas...*");

            // 2. Baca Database Akademik
            const dbPath = './database/academic.json';
            const dataRaw = await fs.readFile(dbPath, 'utf8');
            const db = JSON.parse(dataRaw);

            // 3. Filter semua tugas yang statusnya PENDING
            const listPending = db.tugas.filter(t => t.status === 'PENDING');

            // Jika tidak ada tugas pending, kirim satu dummy buat ngetest
            if (listPending.length === 0) {
                await reply("💡 *Database Kosong:* Mengirim 1 tugas simulasi dummy...");
                listPending.push({
                    mk: "MATA KULIAH TEST (DUMMY)",
                    nama: "Tugas Simulasi Sistem",
                    tipe: "Individu",
                    deadlineDate: moment().tz(config.timezone).add(1, 'days').format('DD-MM-YYYY'),
                    notifTime: "07:00"
                });
            }

            let successWA = 0;
            let successDiscord = 0;

            // 4. Loop dan kirim notifikasi untuk setiap tugas
            for (let tugas of listPending) {
                const dlDate = moment(tugas.deadlineDate, 'DD-MM-YYYY');
                const diffDays = dlDate.diff(moment().tz(config.timezone).startOf('day'), 'days');
                const statusWaktu = diffDays === 0 ? "HARI INI!" : diffDays === 1 ? "BESOK!" : `${diffDays} hari lagi`;
                
                const teks = `🚨 *PENGINGAT TUGAS (TEST)*\n\n` +
                             `📘 *MK:* ${tugas.mk}\n` +
                             `📝 *Tugas:* ${tugas.nama}\n` +
                             `👥 *Tipe:* ${tugas.tipe}\n` +
                             `📅 *Deadline:* ${tugas.deadlineDate} (${statusWaktu})\n\n` +
                             `⚠️ *STATUS:* MASIH PENDING!\n` +
                             `_Log: ${moment().tz(config.timezone).format('HH:mm:ss')} WITA_`;

                // Kirim ke WA (PM Owner)
                try {
                    await sock.sendMessage(config.ownerNumber, { text: teks });
                    successWA++;
                } catch (e) { console.error("WA Test Error:", e.message); }

                // Kirim ke Discord jika webhook ada
                if (config.discord.webhookAkademik && config.discord.webhookAkademik !== "") {
                    try {
                        await axios.post(config.discord.webhookAkademik, {
                            content: `📢 <@${config.discord.myDiscordId}> **TEST NOTIFIKASI TUGAS**\n${teks.replace(/\*/g, '')}`
                        });
                        successDiscord++;
                    } catch (e) { console.error("Discord Test Error:", e.message); }
                }
                
                // Kasih delay dikit antar pengiriman biar gak dianggap spam oleh server WA
                await new Promise(resolve => setTimeout(resolve, 1500));
            }

            // 5. Laporan akhir ke user
            const report = `✅ *SIMULASI SELESAI*\n\n` +
                           `📦 Total Tugas Di-test: ${listPending.length}\n` +
                           `📱 WhatsApp Terkirim: ${successWA}\n` +
                           `💬 Discord Terkirim: ${successDiscord}\n\n` +
                           `_Cek PM WhatsApp lo sekarang buat liat hasilnya!_`;
            
            await reply(report);

        } catch (err) {
            console.error(err);
            await reply(`❌ *Terjadi Error:* ${err.message}`);
        }
    }
};