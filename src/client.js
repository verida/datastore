/*eslint no-console: "off"*/
const axios = require('axios');

class Client {

    constructor(dataserver) {
        this._dataserver = dataserver;
        this._axios = null;

        this.username = null;
        this.signature = null;
        this.isProfile =  this._dataserver.config.isProfile ? true : false;
    }

    async getUser(did) {
        return this.getAxios(true).get(this._dataserver.serverUrl + "user/get?did=" + did);
    }

    async getPublicUser() {
        return this.getAxios(false).get(this._dataserver.serverUrl + "user/public");
    }

    async createUser(did) {
        return this.getAxios(true).post(this._dataserver.serverUrl + "user/create", {
            did: did
        });
    }

    async createDatabase(did, databaseName, options) {
        options = options ? options : {};
        return this.getAxios(true).post(this._dataserver.serverUrl + "user/createDatabase", {
            did: did,
            databaseName: databaseName,
            options: options
        });
    }

    async updateDatabase(did, databaseName, options) {
        options = options ? options : {};
        return this.getAxios(true).post(this._dataserver.serverUrl + "user/updateDatabase", {
            did: did,
            databaseName: databaseName,
            options: options
        });
    }

    getAxios(includeAuth) {
        let config = {
            headers: {
                "Application-Name": this._dataserver.appName,
                "Profile-Request": this.isProfile
            }
        };

        if (includeAuth) {
            if (!this.username) {
                throw Error("Username not specified");
            }

            if (!this.signature) {
                throw Error("Signature not specified");
            }

            config.auth = {
                username: this.username.replace(/:/g, "_"),
                password: this.signature
            };
        }

        return axios.create(config);
    }

}

export default Client;