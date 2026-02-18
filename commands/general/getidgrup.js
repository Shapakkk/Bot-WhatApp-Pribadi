module.exports = {
    name: 'getidgrup',
    category: 'general',
    async execute(sock, msg, args, config) {
        const from = msg.key.remoteJid;
        const q = args[0];

        if (q && q.includes('chat.whatsapp.com')) {
            const code = q.split('chat.whatsapp.com/')[1];
            const info = await sock.groupGetInviteInfo(code);
            return sock.sendMessage(from, { text: `Nama: ${info.subject}\nID: ${info.id}@g.us` });
        }

        if (from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: `ID Grup Ini: ${from}` });
        }

        await sock.sendMessage(from, { text: 'Kirim link grup atau ketik ini di dalam grup, Bre!' });
    }
};