
let config = {
    environment: process.env.VERIDA_ENVIRONMENT || "testnet",
    appName: process.env.VERIDA_APP_NAME || "Test App",
    appHost: process.env.VERIDA_APP_HOST || (process.browser ? window.location.origin : null),
    servers: {
        local: {
            appServerUrl: "http://localhost:5000/",
            didServerUrl: "http://localhost:5001/"
        },
        testnet: {
            appServerUrl: "https://dataserver.testnet.verida.io:5000/",
            didServerUrl: "https://did.testnet.verida.io:5001/"
        },
        mainnet: {
            appServerUrl: "https://dataserver.mainnet.verida.io:5000/",
            didServerUrl: "https://did.mainnet.verida.io:5001/"
        },
        custom: {
            appServerUrl: process.env.VERIDA_SERVERS_CUSTOM_APP_SERVER_URL,
            didServerUrl: process.env.VERIDA_SERVERS_CUSTOM_DID_SERVER_URL,
        }
    },
    datastores: {
        default: {
            privacy: process.env.VERIDA_DATASTORES_DEFAULT_PRIVACY || "private"
        }
    },
    schemas: {
        basePath: process.env.VERIDA_SCHEMAS_BASE_PATH || '/schemas/base/',
        customPath: process.env.VERIDA_SCHEMAS_CUSTOM_PATH || '/schemas/custom/'
    },
    vaultAppName: "Verida Vault"
};

config.server = config.servers[config.environment];

module.exports = config;