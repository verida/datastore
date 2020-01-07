const axios = require('axios');

class Client {

    constructor(app) {
        this._app = app;
        this._axios = null;

        this.username = null;
        this.password = null;
    }

    async getUser(did) {
        return this.getAxios().get(this._app.config.serverUrl + "user/get?did=" + did);
    }

    async createUser(did, password) {
        return this.getAxios().post(this._app.config.serverUrl + "user/create", {
            did: did,
            password: password
        });
    }

    async createDatabase(did, databaseName) {
        this.getAxios().post(this._app.config.serverUrl + "user/createDatabase", {
            did: did,
            databaseName: databaseName
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
                    "Application-Name": this._app.name
                }
            });
        }

        return this._axios;
    }

}

export default Client;