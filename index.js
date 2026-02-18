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
const path = require('path');
const moment = require('moment-timezone');
const { handler } = require('./handler');

// 1. Logger Level Fatal (Biar terminal gak nyampah)
const logger = P({ level: 'fatal' });

async function startBot() {
    // Jalankan loader command
    const { loadCommands } = require('./handler'); 
    loadCommands('commands');

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
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(
                message.buttonsMessage ||
                message.templateMessage ||
                message.listMessage
            );
            if (requiresPatch) {
                message = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2
                            },
                            ...message
                        }
                    }
                };
            }
            return message;
        }
    });

    const config = JSON.parse(fs.readFileSync('./config.json'));

    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(config.phoneNumber);
                console.log(`\n[ PAIRING CODE ]: ${code}\n`);
            } catch {}
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
            console.log(`[ ONLINE ] Berhasil sebagai ${config.botName}`);
            // Jalankan Scheduler
            try {
                const { runScheduler } = require('./lib/scheduler');
                runScheduler(sock);
            } catch (e) {}
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        
        // Auto Read dari config
        if (config.autoRead) await sock.readMessages([msg.key]);

        await handler(sock, msg);
    });
}

startBot();