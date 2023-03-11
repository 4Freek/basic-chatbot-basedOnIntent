// For more information read the file README.md

import { Provider } from "./providers";

const args = Object.fromEntries(
    process.argv.map(a => a.split('=').map(a => a.trim().toLowerCase()))
)

console.log(`Usage: 
\n you can assign either one between valid providers. Ej.

    --provider=baileys or --provider=wwebjs

    by default provider is baileys
`)

const client = new Provider(args['--provider'])

client.create({})

client.on('message', (message: any) => {
    console.log('msg', JSON.stringify(message, undefined, 4));
})