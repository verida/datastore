
module.exports = {
    appServerUrl: "https://dataserver.alpha.verida.io:5000/",
    didServerUrl: "https://did.alpha.verida.io:5001/",
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