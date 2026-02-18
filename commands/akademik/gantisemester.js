const fs = require('fs');

module.exports = {
    name: 'gantisemester',
    category: 'akademik',
    async execute(sock, msg, args, config) {
        const from = msg.key.remoteJid;

        // Reset data akademik
        const emptyDB = { mk: [], tugas: [] };
        fs.writeFileSync('./database/academic.json', JSON.stringify(emptyDB, null, 2));

        await sock.sendMessage(from, { 
            text: `🚀 *GANTI SEMESTER BERHASIL*\n\nSemua data Mata Kuliah dan Tugas telah dihapus bersih. Selamat berjuang di semester baru, Bre!` 
        });
    }
};