module.exports = {
    name: 'help',
    category: 'general',
    async execute(sock, msg, args, config) {
        let teks = `*🤖 ${config.botName} HELP MENU*\n\n`;
        const cats = {};

        global.commands.forEach(c => {
            if (!cats[c.category]) cats[c.category] = [];
            cats[c.category].push(c.name);
        });

        for (let cat in cats) {
            teks += `*── [ ${cat.toUpperCase()} ] ──*\n`;
            teks += `> ${cats[cat].join(', ')}\n\n`;
        }

        await sock.sendMessage(msg.key.remoteJid, { text: teks });
    }
};