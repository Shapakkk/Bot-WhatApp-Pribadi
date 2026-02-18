const fs = require('fs');
const path = require('path');

// Global Map untuk simpan command
global.commands = new Map();

const loadCommands = (dir) => {
    const files = fs.readdirSync(path.join(__dirname, dir));
    for (const file of files) {
        const stat = fs.lstatSync(path.join(__dirname, dir, file));
        if (stat.isDirectory()) {
            loadCommands(path.join(dir, file));
        } else if (file.endsWith('.js')) {
            const cmdPath = path.join(__dirname, dir, file);
            delete require.cache[require.resolve(cmdPath)];
            const cmd = require(cmdPath);
            global.commands.set(cmd.name, cmd);
        }
    }
};

async function handler(sock, msg) {
    try {
        const config = JSON.parse(fs.readFileSync('./config.json'));
        const from = msg.key.remoteJid;
        
        // Body Parser
        const type = Object.keys(msg.message || {})[0];
        const body = (type === 'conversation') ? msg.message.conversation :
                     (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text :
                     (type === 'imageMessage') ? msg.message.imageMessage.caption :
                     (type === 'videoMessage') ? msg.message.videoMessage.caption : '';

        if (!body.startsWith(config.prefix)) return;

        const args = body.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        const cmd = global.commands.get(commandName);
        if (!cmd) return;

        // DEBUG LOG
        const sender = msg.key.participant || msg.key.remoteJid;
        console.log(`[ CMD ] ${commandName} | Dari: ${sender.split('@')[0]} | Target: ${from}`);

        // FUNGSI REPLY SAKTI (Supaya bot bales di grup dengan ngetag pesan)
        const reply = async (text) => {
            return await sock.sendMessage(from, { text: text }, { quoted: msg });
        };

        // Kirim 'sock' dan 'msg' yang sudah dimodifikasi ke execute
        await cmd.execute(sock, msg, args, config, reply);

    } catch (err) {
        console.error(`[ ERROR ] Handler:`, err.message);
    }
}

module.exports = { handler, loadCommands };