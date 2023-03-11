# INSTALLATION AND RUN

- MOCK INTENTS EXAMPLE

```json
{
    "intents": [
        {
            "intent": "Hello World",
            "patterns": [
                "Hello",
                "world",
                "hi",
                "hey there"
            ],
            "responses":[
                "hello friend",
                "hey there",
                "hi!"
            ],
            "putAttention": false
        }
    ]
}
```

:memo: The chatbot understands the flow of messages from intents.json file, it's required

```bash
    # copy the repository from master branch
    # install all dependencies
    npm i
```

``` typescript
    //  Create Baileys provider
    // A configuration Object is optional by default configuration Object is created
    const client = new Provider('Baileys').create(...configurations)

    client.on('message', function (message) {
        // write your code
        // ...
    })
```

## :memo: Availables providers

- [x] Baileys
- [x] whatsapp-web.js
- [x] wppconnect
