
let config = {
    environment: process.env.VERIDA_ENVIRONMENT || "testnet",
    appName: process.env.VERIDA_APP_NAME || "Test App",
    appHost: process.env.VERIDA_APP_HOST || (process.browser && window ? window.location.origin : null),
    servers: {
        local: {
            // For core development
            appServerUrl: "http://localhost:5000/",
            didServerUrl: "http://localhost:5001/",
            schemaPaths: {
                '/': 'https://schemas.verida.io/',
                'https://schemas.verida.io/': 'http://localhost:5010/'
            }
        },
        testnet: {
            appServerUrl: "https://dataserver.testnet.verida.io:5000/",
            didServerUrl: "https://did.testnet.verida.io:5001/",
            baseSchemas: "https://schemas.testnet.verida.io/",
            schemaPaths: {
                '/': 'https://schemas.verida.io/',
                'https://schemas.verida.io/': 'https://schemas.testnet.verida.io/'
            }
        },
        mainnet: {
            appServerUrl: "https://dataserver.mainnet.verida.io:5000/",
            didServerUrl: "https://did.mainnet.verida.io:5001/",
            schemaPaths: {
                '/': 'https://schemas.verida.io/'
            }
        },
        custom: {
            appServerUrl: process.env.VERIDA_SERVERS_CUSTOM_APP_SERVER_URL,
            didServerUrl: process.env.VERIDA_SERVERS_CUSTOM_DID_SERVER_URL,
            schemaPaths: {
                '/': 'https://schemas.verida.io/'
            }
        }
    },
    datastores: {},
    vaultAppName: "Verida Vault"
};

config.server = config.servers[config.environment];

module.exports = config;