const fs = require('fs').promises;

module.exports = {
    name: 'confirmtugas',
    aliases: ['selesai'], // Tambahan Alias
    category: 'akademik',
    async execute(sock, msg, args, config, reply) {
        const target = args.join(' ').trim();

        try {
            const dbPath = './database/academic.json';
            const dataRaw = await fs.readFile(dbPath, 'utf8');
            let db = JSON.parse(dataRaw);
            const pendingTasks = db.tugas.filter(t => t.status === 'PENDING');

            if (pendingTasks.length === 0) return reply("📭 Nggak ada tugas pending yang bisa dikonfirmasi, Bre.");

            // 1. FITUR AUTO-LIST: Jika input kosong
            if (!target) {
                let listTeks = `📝 *PILIH TUGAS YANG SELESAI*\n\n`;
                pendingTasks.forEach((t, i) => {
                    listTeks += `${i + 1}. *${t.nama}*\n   └ MK: ${t.mk}\n`;
                });
                listTeks += `\n──────────────────\n`;
                listTeks += `💡 *Cara:* Ketik \`.selesai [Nomor]\`\n`;
                listTeks += `Contoh: \`.selesai 1\``;
                return reply(listTeks);
            }

            // 2. PROSES KONFIRMASI (Fix Index Mismatch)
            let taskToFinish;
            if (!isNaN(target)) {
                const index = parseInt(target) - 1;
                taskToFinish = pendingTasks[index];
            } else {
                taskToFinish = pendingTasks.find(x => x.nama.toLowerCase() === target.toLowerCase());
            }

            if (!taskToFinish) {
                return reply(`❌ Nomor/Nama tugas *"${target}"* nggak ada di daftar pending.`);
            }

            // Update di database utama berdasarkan ID unik
            const actualIndex = db.tugas.findIndex(t => t.id === taskToFinish.id);
            db.tugas[actualIndex].status = 'SELESAI';

            await fs.writeFile(dbPath, JSON.stringify(db, null, 2));

            await reply(`🎉 *Mantap!* Tugas *${taskToFinish.nama}* sudah ditandai SELESAI.`);

        } catch (err) {
            console.error(err);
            await reply("❌ Gagal memproses data.");
        }
    }
};