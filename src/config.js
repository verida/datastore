
module.exports = {
    appServerUrl: "http://datastore.dev.verida.io:5000/",
    userServerUrl: "http://datastore.dev.verida.io:5000/",
    didServerUrl: "http://did.dev.verida.io:5001/",
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