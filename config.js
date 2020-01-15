
module.exports = {
    appServerUrl: "http://datastore.dev.verida.io:5000/",
    userServerUrl: "http://datastore.dev.verida.io:5000/",
    dbHashKey: "9c2b7826978f2c49678",
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