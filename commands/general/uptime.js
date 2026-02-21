const os = require('os');
const fs = require('fs');
const moment = require('moment-timezone');

module.exports = {
    name: 'uptime',
    category: 'general',
    async execute(sock, msg, args, config, reply) {
        const start = Date.now();
        
        const uptimeSeconds = process.uptime();
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);

        const load = os.loadavg();
        const cpuUsage = ((load[0] / os.cpus().length) * 100).toFixed(2);

        // Suhu CPU (Coba beberapa jalur umum Linux)
        let temp = "N/A";
        const paths = [
            '/sys/class/thermal/thermal_zone0/temp',
            '/sys/class/thermal/thermal_zone1/temp',
            '/sys/class/hwmon/hwmon0/temp1_input',
            '/sys/class/hwmon/hwmon1/temp1_input'
        ];

        for (let p of paths) {
            if (fs.existsSync(p)) {
                const raw = fs.readFileSync(p, 'utf8');
                temp = (parseInt(raw) / (raw.length > 5 ? 1000 : 1)).toFixed(1) + '°C';
                break;
            }
        }

        const ping = Date.now() - start;

        const response = `🖥️ *SISTEM MONITOR*\n\n` +
                         `🤖 *Status:* Online\n` +
                         `⚡ *Ping:* ${ping}ms\n` +
                         `⏳ *Uptime:* ${hours}j ${minutes}m ${seconds}s\n` +
                         `📊 *CPU:* ${cpuUsage}%\n` +
                         `🌡️ *Temp:* ${temp}\n` +
                         `🧠 *RAM:* ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB / ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB\n\n` +
                         `📅 ${moment().tz(config.timezone).format('HH:mm:ss')} WITA`;

        await reply(response);
    }
};