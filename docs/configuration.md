# Datastore Configuration

## Available options

Available options are:

* **VERIDA_ENVIRONMENT:** `testnet`, `mainnet` or `local`.
* **VERIDA_APP_NAME:** String representing the name of your application.
* **VERIDA_APP_HOST:** Hostname where your application lives. This is used to populate the `serviceUrl` in a user's DID document so other applications can discover your application.

### Schemas

When you create a custom schema for your application, you will typically host it with your application. The default option is to use the path `http(s)://<your host>/schemas/custom`, however you can change this to be any URL or absolute path.

## Via Code

You can configure variables within your code as follows:

```
import Verida as '@verida/datastore'

Verida.setConfig({
    environment: 'testnet',
    appName: 'Company: My Application',
    appHost: 'https://www.mycompany.com/'
});
```

## Via Environment Variables

You can use environment variables in your Node.js application to configure the library. Create a `.env` file (if not already existing) in your application root and set your own options.

For example:

```
VERIDA_APP_NAME="My Application"
```

!>Vue.js mangles environment variables. See [Frameworks](/frameworks) for details.