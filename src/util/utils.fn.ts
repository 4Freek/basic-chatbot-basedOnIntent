import fs from 'fs';
import { IIntents } from '../shared/interfaces/intents.interface';

// dict of letter key:value pairs
const chars: any = {
    á: 'a',
    é: 'e',
    í: 'i',
    ó: 'o',
    ú: 'u',
    à: 'a',
    è: 'e',
    ì: 'i',
    ò: 'o',
    ù: 'u',
    Á: 'A',
    É: 'E',
    Í: 'I',
    Ó: 'O',
    Ú: 'U',
    À: 'A',
    È: 'E',
    Ì: 'I',
    Ò: 'O',
    Ù: 'U'
};

// clean the quotes from the message string
const cleanQuotes = (message: string): string => {
    let sanity_msg = message;
    for (let letter of sanity_msg) {
        if (chars[letter]) {
            let newLetter = chars[letter];
            sanity_msg = sanity_msg.replace(letter, newLetter);
        }
    }

    return sanity_msg
}

// clean the message string and convert it to lowercase
const cleanMessage = (message: string): string =>  {
    message = cleanQuotes(message)
   return String(message)
        .toLowerCase()
        .replace(
            /(-|\n|\/|\.)/gim,
            ""
        )
        .trim()
}

// open a file with the content or flow to bot response
const openFileIntents = (path: string|null=null): any => {
    try {
        if (!path) {
            return new Promise((resolve, reject) => {
                fs.readFile('intents.json', (err, data) => {
                    if (err) reject(err);
    
                    return resolve(data);
                })
            })
        }
    
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) reject(err);
    
                return resolve(data);
            })
        })
    } catch (error) {
        return null
    }
}

// search by intent into intents json file
const matchWithIntent = async (message: string): Promise<string[]|unknown> => {
    try {
        
        const intents = JSON.parse((await openFileIntents()))

        if (!intents) return

        const cleaned = cleanMessage(message)
        
        const intent = Object.values(intents['intents'])
        .filter((intent:any) => {
            const re = new RegExp(
                `(${intent.intent}|${String(intent.patterns.join('|'))})\\.*`,
                 'gim')
                 
            if (cleaned.match(re)) return intent
            else return
        }) as IIntents[]

        return intent[0]?.responses || []
    } catch (error) {
        throw Error("[ERROR]: An Error has occurred")
    }
}

// get reponse from message event by chatbot triggered
export const response = async (message: string): Promise<string|unknown> => {
    
    const responses = await matchWithIntent(message) as any[]
    
    if (!responses || !responses.length) return

    const idx = Math.round(Math.random() * responses.length)
    
    return responses[idx]
}