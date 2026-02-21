const { backupSistem } = require('../../lib/scheduler');

module.exports = {
    name: 'backup',
    category: 'owner',
    async execute(sock, msg, args, config, reply) {
        // Ambil ID pengirim (bisa dari grup atau private chat)
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender.includes(config.ownerNumber.split('@')[0]);

        if (!isOwner) return reply("❌ Khusus Owner, Bre!");

        // Cek apakah Webhook Backup sudah di-set
        if (!config.discord.webhookBackup || config.discord.webhookBackup === "") {
            return reply(`⚠️ *Setting Belum Lengkap, Boss!*\n\nWebhook Discord untuk backup belum diisi di config.json.\n\nSilahkan setting dulu lewat WA dengan ketik:\n\`.set discord.webhookBackup|URL_WEBHOOK_LO\``);
        }

        await reply("🔄 *Sedang mencadangkan data ke Discord...*");
        const success = await backupSistem(sock, false);
        
        if (success) {
            await reply("✅ *Backup Berhasil!* File config dan database sudah dikirim ke Discord.");
        } else {
            await reply("❌ *Backup Gagal!* Terjadi kesalahan saat mengirim file. Cek log console atau pastikan URL Webhook valid.");
        }
    }
};