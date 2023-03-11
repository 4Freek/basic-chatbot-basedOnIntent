// For more information read the file README.md

import { Provider } from "./providers";

const provider = new Provider('baileys')

provider.create({})

provider.on('message', (message: any) => {
    console.log('msg', JSON.stringify(message, undefined, 4));
})