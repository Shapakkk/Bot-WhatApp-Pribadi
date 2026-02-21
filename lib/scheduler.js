const cron = require('node-cron');
const fs = require('fs').promises;
const moment = require('moment-timezone');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

const runScheduler = (sock) => {
    // 1. PENGINGAT TUGAS (Tiap Menit)
    cron.schedule('* * * * *', async () => {
        try {
            const config = JSON.parse(await fs.readFile('./config.json', 'utf8'));
            const dbPath = './database/academic.json';
            const db = JSON.parse(await fs.readFile(dbPath, 'utf8'));
            const now = moment().tz(config.timezone);
            const todayStr = now.format('YYYY-MM-DD');
            const timeNow = now.format('HH:mm');

            let changed = false;
            for (let tugas of db.tugas) {
                if (tugas.status !== 'PENDING') continue;

                const dlDate = moment(tugas.deadlineDate, 'DD-MM-YYYY');
                const diffDays = dlDate.diff(now.startOf('day'), 'days');
                let mustNotify = false;

                if (tugas.notifTime === timeNow) {
                    if (tugas.notifMode === '1') mustNotify = true;
                    else if (tugas.notifMode === '2' && diffDays % 2 === 0) mustNotify = true;
                    else if (tugas.notifMode === '3' && diffDays === 1) mustNotify = true;
                }

                // Cek agar tidak dobel notif di hari yang sama
                if (mustNotify && tugas.lastNotified !== todayStr) {
                    const statusWaktu = diffDays === 0 ? "HARI INI!" : diffDays === 1 ? "BESOK!" : `${diffDays} hari lagi`;
                    const teks = `🚨 *REMINDER TUGAS*\n\n📘 *MK:* ${tugas.mk}\n📝 *Tugas:* ${tugas.nama}\n📅 *DL:* ${tugas.deadlineDate} (${statusWaktu})`;

                    // Kirim WA
                    await sock.sendMessage(config.ownerNumber, { text: teks });

                    // Kirim Discord
                    if (config.discord.webhookAkademik) {
                        await axios.post(config.discord.webhookAkademik, {
                            content: `📢 <@${config.discord.myDiscordId}> Oi Bre! Ada tugas nih:\n${teks.replace(/\*/g, '')}`
                        });
                    }
                    tugas.lastNotified = todayStr;
                    changed = true;
                }
            }
            if (changed) await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
        } catch (e) {}
    });

    // 2. BACKUP OTOMATIS (Jam 06:00, 12:00, 18:00, 00:00)
    cron.schedule('0 0,6,12,18 * * *', async () => {
        console.log("[SYSTEM] Menjalankan Backup Otomatis...");
        await backupSistem(sock, true);
    }, { timezone: "Asia/Makassar" });
};

// Fungsi Backup ke Discord
async function backupSistem(sock, isAuto = false) {
    try {
        const config = JSON.parse(await fs.readFile('./config.json', 'utf8'));
        if (!config.discord.webhookBackup) return;

        const form = new FormData();
        form.append('content', `📦 *BACKUP ${isAuto ? 'OTOMATIS' : 'MANUAL'}*\n⏰ Waktu: ${moment().tz(config.timezone).format('DD/MM/YYYY HH:mm')} WITA`);
        
        // Tambahkan config.json
        form.append('file1', require('fs').createReadStream('./config.json'), 'config.json');
        
        // Tambahkan semua file di database
        const dbFiles = await fs.readdir('./database');
        for (let i = 0; i < dbFiles.length; i++) {
            form.append(`file_db_${i}`, require('fs').createReadStream(`./database/${dbFiles[i]}`), dbFiles[i]);
        }

        await axios.post(config.discord.webhookBackup, form, { headers: form.getHeaders() });
        return true;
    } catch (e) {
        console.error("Backup Gagal:", e);
        return false;
    }
}

module.exports = { runScheduler, backupSistem };