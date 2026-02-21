const fs = require('fs');
const path = require('path');

global.commands = new Map();

const loadCommands = (dir) => {
    const fullDir = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullDir)) return;

    const files = fs.readdirSync(fullDir);
    for (const file of files) {
        const filePath = path.join(fullDir, file);
        const stat = fs.lstatSync(filePath);

        if (stat.isDirectory()) {
            loadCommands(path.join(dir, file));
        } else if (file.endsWith('.js')) {
            try {
                delete require.cache[require.resolve(filePath)];
                const cmd = require(filePath);
                if (cmd.name) global.commands.set(cmd.name, cmd);
            } catch (e) {
                console.error(`[ ERROR ] Gagal muat ${file}:`, e.message);
            }
        }
    }
};

async function handler(sock, msg) {
    try {
        const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
        const from = msg.key.remoteJid;

        const type = Object.keys(msg.message)[0];
        let body = (type === 'conversation') ? msg.message.conversation :
                   (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text :
                   (type === 'imageMessage') ? msg.message.imageMessage.caption :
                   (type === 'videoMessage') ? msg.message.videoMessage.caption : '';

        if (!body || !body.startsWith(config.prefix)) return;

        const args = body.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // LOGIKA ALIASES: Cari di nama utama atau di array aliases
        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.aliases && c.aliases.includes(commandName));

        if (!cmd) return;

        const reply = async (text) => {
            return await sock.sendMessage(from, { text: text }, { quoted: msg });
        };

        const sender = msg.key.participant || msg.key.remoteJid;
        console.log(`[ CMD ] .${commandName} (Alias dari ${cmd.name}) | Dari: ${sender.split('@')[0]}`);

        await cmd.execute(sock, msg, args, config, reply);

    } catch (err) {
        console.error(`[ CRASH ] Handler Error:`, err);
    }
}

module.exports = { handler, loadCommands };