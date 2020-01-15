/*eslint no-console: "off"*/
const axios = require('axios');

class Client {

    constructor(dataserver) {
        this._dataserver = dataserver;
        this._axios = null;

        this.username = null;
        this.password = null;
        this.isProfile =  this._dataserver.config.isProfile ? true : false;
    }

    async getUser(did) {
        return this.getAxios().get(this._dataserver.serverUrl + "user/get?did=" + did);
    }

    async getPublicUser() {
        return this.getAxios().get(this._dataserver.serverUrl + "user/public");
    }

    async createUser(did, password) {
        return this.getAxios().post(this._dataserver.serverUrl + "user/create", {
            did: did,
            password: password
        });
    }

    async createDatabase(did, databaseName, options) {
        options = options ? options : {};
        this.getAxios().post(this._dataserver.serverUrl + "user/createDatabase", {
            did: did,
            databaseName: databaseName,
            options: options
        });
    }

    getAxios() {
        if (!this._axios) {
            this._axios = axios.create({
                auth: {
                    username: this.username.replace(/:/g, "_"),
                    password: this.password
                },
                headers: {
                    "Application-Name": this._dataserver.appName,
                    "Profile-Request": this.isProfile
                }
            });
        }

        return this._axios;
    }

}

export default Client;