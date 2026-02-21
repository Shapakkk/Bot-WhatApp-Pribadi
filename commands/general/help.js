module.exports = {
    name: 'help',
    aliases: ['menu', 'list'], // Tambahan Alias
    category: 'general',
    async execute(sock, msg, args, config, reply) {
        let teks = `*🤖 ${config.botName} HELP MENU*\n\n`;
        const cats = {};

        global.commands.forEach(c => {
            if (!cats[c.category]) cats[c.category] = [];
            // Tampilkan nama utama dan aliases jika ada
            let cmdLine = `.${c.name}`;
            if (c.aliases) cmdLine += ` (${c.aliases.join(', ')})`;
            cats[c.category].push(cmdLine);
        });

        for (let cat in cats) {
            teks += `*── [ ${cat.toUpperCase()} ] ──*\n`;
            teks += `> ${cats[cat].join('\n> ')}\n\n`;
        }

        teks += `_Gunakan prefix [ ${config.prefix} ] sebelum perintah._`;
        await reply(teks);
    }
};