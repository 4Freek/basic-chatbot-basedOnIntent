import { Base } from "../shared/interfaces/provider.base.interface";

// Provider extends from base provider which implements an interface that exposes the 
// required functionality
export class Proviver extends Base {

    constructor(
        private readonly provider: "baileys" | "wwebjs" | "wppconnect"
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
    protected get name(): string | undefined {
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
    protected create<T>(options: {} | undefined): T {
        throw new Error("Method not implemented.");
    }

}