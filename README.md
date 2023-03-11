# INSTALLATION AND RUN

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