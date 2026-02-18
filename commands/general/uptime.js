const os = require('os');
const fs = require('fs');
const moment = require('moment-timezone');

module.exports = {
    name: 'uptime',
    category: 'general',
    async execute(sock, msg, args, config) {
        // 1. Hitung Uptime
        const uptimeSeconds = process.uptime();
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);

        // 2. Hitung Penggunaan CPU (Load Average)
        const cpus = os.cpus();
        const load = os.loadavg();
        const cpuUsage = ((load[0] / os.cpus().length) * 100).toFixed(2);

        // 3. Baca Suhu CPU (Khusus Linux/STB)
        let temp = "N/A (Non-Linux)";
        if (os.platform() === 'linux') {
            try {
                const thermalPath = '/sys/class/thermal/thermal_zone0/temp';
                if (fs.existsSync(thermalPath)) {
                    const rawTemp = fs.readFileSync(thermalPath, 'utf8');
                    temp = (parseInt(rawTemp) / 1000).toFixed(1) + '°C';
                }
            } catch (e) {
                temp = "Error reading temp";
            }
        }

        const jamSekarang = moment().tz(config.timezone).format('HH:mm:ss');
        const tglSekarang = moment().tz(config.timezone).format('DD MMMM YYYY');

        const response = `🖥️ *SISTEM MONITOR*\n\n` +
                         `🤖 *Status Bot:* Online\n` +
                         `⏳ *Uptime:* ${hours}j ${minutes}m ${seconds}s\n` +
                         `📊 *CPU Load:* ${cpuUsage}%\n` +
                         `🌡️ *CPU Temp:* ${temp}\n` +
                         `🧠 *RAM:* ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB / ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB\n\n` +
                         `📅 *Waktu:* ${jamSekarang} WITA\n` +
                         `📆 *Tanggal:* ${tglSekarang}`;

        await sock.sendMessage(msg.key.remoteJid, { text: response });
    }
};