
module.exports = {
    appServerUrl: "http://datastore.dev.verida.io:5000/",
    appHost: "localhost",
    userServerUrl: "http://datastore.dev.verida.io:5000/",
    dbHashKey: "9c2b7826978f2c49678",
    walletDsn: 'http://datastore.dev.verida.io:5984/',
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