
// WHATSAPP CONFIGURATIONS
import qrcode from 'qrcode-terminal';
import { Buttons, MessageAck, Contact, MessageMedia, MessageContent, MessageSendOptions, Client, Call, Message } from 'whatsapp-web.js/index';

import { ClientOptions, LocalAuth, NoAuth } from "whatsapp-web.js";
import { COMMAND_NOT_ACCEPTABLE, EVENTS_NOT_ACCEPTABLE, PUPPETEER_ARGS_FLAGS } from '../../shared/config';
import { Base } from '../../shared/interfaces/provider.base.interface';
import { emitter } from '../../shared/events/emitter';

// RUTA DONDE SE MANEJA EL GUARDADO DE SESIONES WORKERS
// const dataPath: string = './dist/src/.wwebjs_auth';

// BUSCA CREDENCIALES DE SESION Y LA REUTILIZA
const AUTHSTRATEGY: {LocalAuth: LocalAuth, NoAuth: NoAuth} = {
    LocalAuth: new LocalAuth({
        clientId:  'chatbot',
    }),
    NoAuth: new NoAuth()
};


// CONFIGURACIONES OPCIONALES DE CLIENTE 
const CONFIG_INIT: ClientOptions = {
    takeoverOnConflict: true,
    takeoverTimeoutMs: 5000,
    authTimeoutMs: 30000,
    authStrategy: AUTHSTRATEGY.LocalAuth,
    puppeteer: {
        headless: true,
        args: [...PUPPETEER_ARGS_FLAGS]
    }
}

export class WwebjsProvider extends Base {
    get name(): string {
        return 'wwebjs';
    }
    // FUNCION PRINCIPAL DE LA APLICACION
    async create(options?: {}): Promise<any> {
        let opts = CONFIG_INIT;

        if (options)
            opts = Object.assign(opts, options);

        const client = new Client(opts);


        // EMISION DE QR EN CASO NO EXISTA UNA SESION ACTIVA
        client.once('qr', (qr) => {
            qrcode.generate(qr, { small: true });
        });

        // SI EL QR LANZA UN ERROR PASA A SER DESCONECTADO
        client.once('auth_failure', (): void => {
            console.log('** ERROR AL VERIFICAR QRCODE **');
        });

        // UNA VEZ QUE EL CLIENTE ESTA AUTENTICADO SE EJECUTA LA FUNCION DE CONEXION
        client.once('ready', (): void => {
            console.log('Provider connected');

        });


        client.on('incoming_call', async (call: Call) => {
            try {
                // if (call.from) 
                await call.reject();
                return;
            } catch (_) { }
        });
        client.on('message', async (msg: Message) => {
            try {
                if (this.invalidate(msg)) return;

                emitter.emit('message', msg)
            } catch (error) { }
        });
        // *-----------------------------------------------------------
        // MAIN THREAD
        await client.initialize();

        return {
            ...client,
            send: async (args: {
                from: string;
                msg: string;
                options?: any;
            }) => {
                const opts = args.options ?? {};
                await client.sendMessage(args.from, args.msg, {
                    ...opts,
                    linkPreview: true
                });
            }
        };
    }

    private invalidate(msg: Message) {
        return (
            msg.isGif ||
            msg.fromMe ||
            msg.isStatus ||
            msg.isStarred ||
            COMMAND_NOT_ACCEPTABLE.includes(msg.type) ||
            EVENTS_NOT_ACCEPTABLE.includes(msg.type) ||
            msg.hasMedia
        )
    }

}



