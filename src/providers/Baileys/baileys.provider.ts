import makeWASocket, {
    Browsers,
    delay,
    DisconnectReason,
    fetchLatestBaileysVersion,
    MessageUpsertType,
    MiscMessageGenerationOptions,
    proto,
    useMultiFileAuthState,
    UserFacingSocketConfig,
    WACallEvent,
} from '@adiwajshing/baileys';

import { join } from 'path';
import pino from 'pino';
import { rimraf } from 'rimraf';
import NodeCache from 'node-cache';
import { emitter } from '../../shared/events/emitter';
import { Base } from '../../shared/interfaces/provider.base.interface';

const logger = pino({ level: 'silent' })

const cache = new NodeCache({
    checkperiod: 10 * 1000,
    stdTTL: 2 * 60 * 1000,
    deleteOnExpire: true,
    errorOnMissing: false,
    forceString: true
})

const DEFAULT_BAILEYS_CONFIG: Partial<UserFacingSocketConfig> = {
    logger,
    printQRInTerminal: true,
    // generateHighQualityLinkPreview: true,
    keepAliveIntervalMs: 10 * 1000,
    emitOwnEvents: false,
    userDevicesCache: cache,
    mediaCache: cache,
    transactionOpts: {
        maxCommitRetries: 7,
        delayBetweenTriesMs: 5 * 1000,
    },
    // shouldSyncHistoryMessage: (history: proto.Message.IHistorySyncNotification) => false,
    browser: Browsers.macOS('Desktop'),
    markOnlineOnConnect: true,
    msgRetryCounterMap: {},
    fireInitQueries: true,
    syncFullHistory: false,
    connectTimeoutMs: 0, // 10 * 1000,
    defaultQueryTimeoutMs: 30 * 1000,
    options: {
        signal: new AbortController().signal,
        timeout: 10 * 1000,
    },
    qrTimeout: 0,
    retryRequestDelayMs: 0, // 5 * 1000,
    getMessage: async (key: proto.IMessageKey) => {
        return {
            conversation: 'Si no has tenido alguna respuesta, te invito a intentar nuevamente'
        }
    },
    patchMessageBeforeSending: (message: proto.IMessage) => {
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
                            deviceListMetadataVersion: 2,
                            deviceListMetadata: {},
                        },
                        ...message,
                    },
                },
            };
        }

        return message;
    },
};


export class BaileysProvider extends Base {

    get name(): string {
        return 'baileys'
    }

    async create(options?: {}): Promise<ReturnType<typeof makeWASocket>|any> {
        const { state, saveCreds } = await useMultiFileAuthState('session'); //
        const { version, isLatest } = await fetchLatestBaileysVersion({})
        console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

        let opts = DEFAULT_BAILEYS_CONFIG

        if (options) opts = Object.assign(opts, options)

        const sock = makeWASocket({
            version,
            auth: state,
            ...opts
        });


        try {
            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr, receivedPendingNotifications } = update;

                // @ts-ignore
                const statusCode = lastDisconnect?.error?.output?.statusCode;

                /** Conexion cerrada por diferentes motivos */
                if (connection === 'close') {
                    if (statusCode !== DisconnectReason.loggedOut) {
                        this.create();
                    }

                    if (statusCode === DisconnectReason.loggedOut) {
                        const PATH_BASE = join(process.cwd(), 'session');
                        try {
                            rimraf(PATH_BASE);
                        } catch (_) {

                        }

                        this.create();
                    }
                }
            });

            sock.ev.on('creds.update', async () => await saveCreds());

            sock.ev.on('connection.update', (update) => {
                const { connection, lastDisconnect, receivedPendingNotifications, qr } = update;
    
                if (connection === 'open') {
                    console.log('Provider connected');
                }
            });
    
    
    
            sock.ev.on('call', (calls: WACallEvent[]) => {
                for (const call of calls) sock.rejectCall(call.chatId, call.from)
            })
    
    
            sock.ev.on('messages.upsert', async (message) => {
                if (this.invalidate(message)) return;
                
                emitter.emit('message', (message))
    
    
                await delay(500)
            });

        } catch (_) { }

        return {
            ...sock,
            send: async (dest: string, message: any, options: MiscMessageGenerationOptions|undefined=undefined): Promise<any> => {
                return await sock.sendMessage(dest, {
                    text: message
                }, {
                    ...options || {}
                })
            }
        }
    }

    private invalidate(message: {
        messages: proto.IWebMessageInfo[],
        type: MessageUpsertType
    }) {
        return (
            !['append', 'notify'].includes(message.type) ||
            message.messages[0].key.remoteJid === 'status@broadcast' ||
            !(message.messages[0].message?.conversation ||
                message.messages[0].message?.extendedTextMessage?.text) ||
            message?.messages[0].key?.fromMe
        )
    }
}
