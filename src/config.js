
module.exports = {
    environment: "alpha",
    servers: {
        dev: {
            appServerUrl: "http://localhost:5000/",
            didServerUrl: "http://localhost:5001/",
        },
        alpha: {
            appServerUrl: "https://dataserver.alpha.verida.io:5000/",
            didServerUrl: "https://did.alpha.verida.io:5001/"
        },
    },
    datastores: {
        default: {
            privacy: "private"
        }
    },
    schemas: {
        basePath: '/schemas/',
        customPath: '/customSchemas/'
    },
    vaultAppName: "Verida Vault"
}