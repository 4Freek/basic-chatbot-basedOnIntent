import makeWASocket from "@adiwajshing/baileys";
import { emitter } from "../shared/events/emitter";
import { Base } from "../shared/interfaces/provider.base.interface";
import { BaileysProvider } from "./Baileys/baileys.provider";

// Provider extends from base provider which implements an interface that exposes the 
// required functionality
export class Provider extends Base {

    private readonly _emitter = emitter
    private client!: ReturnType<typeof makeWASocket>

    constructor(
        private readonly provider: "baileys" | "wwebjs" | "wppconnect"='baileys'
    ) {
        super();
        this.provider = provider;
    }

    /**
     * @returns {string} The name of the provider selected
     * 
     * @example
     * provider.name
     */
    get name(): string | undefined {
        return this.provider
    }

    /**
     * 
     * @param options An object with properties that can be passed to the constructor
     * @returns A bot instance
     * 
     * @example
     * provider.create({
     *      session: "bot" 
     * })
     */
    create(options: {} | undefined) {
        
        switch (this.provider) {
            case 'baileys':
                new BaileysProvider().create(options).then(client => this.client = client)
                break
            default:
                new BaileysProvider().create(options).then(client => this.client = client)
                break
                
        }
    }

    async sendMessage(dest: string, content: any, options: {}|undefined = undefined) {
        await this.client.sendMessage(dest, content, options)
    }

    on(event: string, cb: (err: any, message: any) => void) {
        this._emitter.on(event, cb)
    }

}