const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore 
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const P = require('pino');
const fs = require('fs');
const moment = require('moment-timezone');
const { handler, loadCommands } = require('./handler');

const logger = P({ level: 'fatal' });

async function startBot() {
    // 1. Load semua command saat start
    console.log("[ SYSTEM ] Loading commands...");
    loadCommands('commands');
    console.log(`[ SYSTEM ] ${global.commands.size} commands loaded.`);

    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: logger,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        printQRInTerminal: false,
        markOnlineOnConnect: true,
        browser: ['STB-Linux', 'Chrome', '20.0.04']
    });

    const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(config.phoneNumber);
                console.log(`\n[ PAIRING CODE ]: ${code}\n`);
            } catch (e) {}
        }, 5000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom) 
                ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut 
                : true;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log(`\n[ ONLINE ] Berhasil masuk sebagai ${config.botName}`);
            
            // Jalankan Scheduler
            try {
                const { runScheduler } = require('./lib/scheduler');
                runScheduler(sock);
                console.log("[ SYSTEM ] Scheduler Aktif.");
            } catch (e) {
                console.log("[ SYSTEM ] Gagal menjalankan scheduler.");
            }
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        
        if (config.autoRead) await sock.readMessages([msg.key]);
        await handler(sock, msg);
    });
}

startBot();