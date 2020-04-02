# Datastore Configuration

## Available options

Available options are:

* **VERIDA_ENVIRONMENT:** `testnet`, `mainnet` or `local`.
* **VERIDA_APP_NAME:** String representing the name of your application.
* **VERIDA_SCHEMAS_BASE_PATH:** URL path where base schemas can be found. Defaults to `/schemas/base/`.
* **VERIDA_SCHEMAS_CUSTOM_PATH:** URL path where your custom schemas can be found. Defaults to `/schemas/custom/`.
* **VERIDA_APP_HOST:** Hostname where your application lives. This is used to populate the `serviceUrl` in a user's DID document so other applications can discover your application.

### Schemas

When you create a custom schema for your application, you will typically host it with your application. The default option is to use the path `http://<your host>/schemas/custom`, however you can change this to be any URL or absolute path.

## Via Code

You can configure variables within your code as follows:

```
import Verida as '@verida/datastore'

Verida.setConfig({
    environment: "testnet",
    appName: "My Application",
    schemas: {
        basePath: '/schemas/base',
        customPath: '/schemas/custom'
    }
});
```

## Via Environment Variables

You can use environment variables in your Node.js application to configure the library. Create a `.env` file (if not already existing) in your application root and set your own options.

For example:

```
VERIDA_APP_NAME="My Application"
```

!>Vue.js mangles environment variables. See [Frameworks](/frameworks) for details.