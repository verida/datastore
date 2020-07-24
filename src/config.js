import {
    VERIDA_ENVIRONMENT,
    VERIDA_APP_NAME,
    VERIDA_APP_HOST,
    VERIDA_SERVERS_CUSTOM_APP_SERVER_URL,
    VERIDA_SERVERS_CUSTOM_DID_SERVER_URL,
    VERIDA_SERVERS_CUSTOM_SCHEMAS_BASE_PATH,
    VERIDA_SCHEMAS_CUSTOM_PATH,
    VERIDA_SCHEMAS_BASE_PATH
} from 'react-native-dotenv'

const config = {
    environment: VERIDA_ENVIRONMENT || "testnet",
    appName: VERIDA_APP_NAME || "Test App",
    appHost: VERIDA_APP_HOST || null,
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
            appServerUrl: VERIDA_SERVERS_CUSTOM_APP_SERVER_URL,
            didServerUrl: VERIDA_SERVERS_CUSTOM_DID_SERVER_URL,
            baseSchemas: VERIDA_SERVERS_CUSTOM_SCHEMAS_BASE_PATH,
        }
    },
    datastores: {},
    customSchemasPath: VERIDA_SCHEMAS_CUSTOM_PATH,
    baseSchemasPath: VERIDA_SCHEMAS_BASE_PATH,
    vaultAppName: "Verida Vault"
};

config.server = config.servers[config.environment];

module.exports = config;
