
module.exports = {
    appServerUrl: "http://localhost:5000/",
    appHost: "localhost",
    userServerUrl: "http://localhost:5000/",
    dbHashKey: "9c2b7826978f2c49678",
    walletDsn: 'http://localhost:5984/',
    datastores: {
        default: {
            privacy: "private"
        }
    },
    schemas: {
        basePath: '/schemas/',
        customPath: '/customSchemas/'
    }
}