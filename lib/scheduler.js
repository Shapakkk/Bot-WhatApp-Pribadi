const cron = require('node-cron');
const fs = require('fs');
const moment = require('moment-timezone');
const axios = require('axios');

const runScheduler = (sock) => {
    // Jalankan pengecekan setiap menit
    cron.schedule('* * * * *', async () => {
        try {
            const config = JSON.parse(fs.readFileSync('./config.json'));
            const dbPath = './database/academic.json';
            
            if (!fs.existsSync(dbPath)) return;
            const db = JSON.parse(fs.readFileSync(dbPath));
            
            const now = moment().tz(config.timezone);
            const todayStr = now.format('YYYY-MM-DD');
            const timeNow = now.format('HH:mm');

            let changed = false;

            for (let tugas of db.tugas) {
                // Lewati jika tugas sudah selesai
                if (tugas.status !== 'PENDING') continue;

                const dlDate = moment(tugas.deadlineDate, 'DD-MM-YYYY');
                const diffDays = dlDate.diff(now.startOf('day'), 'days');
                
                let mustNotify = false;

                // Logika Opsi Pengingat (notifTime harus sama dengan HH:mm sekarang)
                if (tugas.notifTime === timeNow) {
                    if (tugas.notifMode === '1') { 
                        // Mode 1: Tiap Hari
                        mustNotify = true;
                    } else if (tugas.notifMode === '2') { 
                        // Mode 2: 2 Hari Sekali
                        if (diffDays >= 0 && diffDays % 2 === 0) mustNotify = true;
                    } else if (tugas.notifMode === '3') { 
                        // Mode 3: H-1 Saja
                        if (diffDays === 1) mustNotify = true;
                    }
                }

                // Kirim Notifikasi jika syarat terpenuhi dan belum kirim hari ini
                if (mustNotify && tugas.lastNotified !== todayStr) {
                    const statusWaktu = diffDays === 0 ? "HARI INI!" : diffDays === 1 ? "BESOK!" : `${diffDays} hari lagi`;
                    
                    const teks = `🚨 *PENGINGAT TUGAS KULIAH*\n\n` +
                                 `📘 *MK:* ${tugas.mk}\n` +
                                 `📝 *Tugas:* ${tugas.nama}\n` +
                                 `👥 *Tipe:* ${tugas.tipe}\n` +
                                 `📅 *Deadline:* ${tugas.deadlineDate} (${statusWaktu})\n\n` +
                                 `⚠️ *Status:* MASIH PENDING!\n` +
                                 `_Segera selesaikan dan ketik .confirmtugas untuk mematikan notif._`;

                    // 1. Kirim PM WhatsApp ke Owner
                    await sock.sendMessage(config.ownerNumber, { text: teks }).catch(e => console.log("Gagal kirim WA Notif:", e.message));

                    // 2. Kirim ke Discord Webhook (Tag Discord ID)
                    if (config.discord.webhookAkademik) {
                        await axios.post(config.discord.webhookAkademik, {
                            content: `📢 <@${config.discord.myDiscordId}> Oi Bre! Ada tugas nih:\n${teks}`
                        }).catch(e => console.log("Gagal kirim Discord Notif:", e.message));
                    }

                    // Tandai hari ini sudah dikirim
                    tugas.lastNotified = todayStr;
                    changed = true;
                }
            }

            // Simpan database jika ada update status notifikasi
            if (changed) {
                fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            }

        } catch (err) {
            console.error('[SCHEDULER ERROR]:', err.message);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Makassar"
    });
};

module.exports = { runScheduler };