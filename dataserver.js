/*eslint no-console: "off"*/
const pbkdf2 = require('native-crypto/pbkdf2');
const _ = require('lodash');

import Datastore from "./datastore";
import Client from "./client";

class DataServer {

    constructor(app, config) {
        this.app = app;
        this.config = {
            datastores: {}
        };
        _.merge(this.config, config);

        this.appName = app.name;
        this.appHost = config.appHost ? config.appHost : "localhost";
        this.serverUrl = config.serverUrl;
        this.hashKey = app.config.dbHashKey;

        this.client = new Client(this);
        this.client.hostName = this.appHost;
        
        this.signature = null;
        this.dsn = null;
        this.salt = null;
        this.key = null;

        this._datastores = {};
    }

    async connect() {
        let user = this.app.user;
        let web3 = await user.getWeb3Provider();
        let signMessage = this._getSignMessage();
        this.signature = await web3.eth.personal.sign(signMessage, user.address);

        // Fetch user details from server
        let response;
        try {
            this.client.username = user.did;
            this.client.password = this.signature;
            response = await this.client.getUser(user.did);
        } catch (err) {
            if (err.response && err.response.data.data && err.response.data.data.did == "Invalid DID specified") {
                // User doesn't exist, so create
                response = await this.client.createUser(user.did);
            }
            else {
                // Unknown error
                throw err;
            }
        }

        // Populate the rest of this user object
        this.dsn = response.data.user.dsn;
        this.salt = response.data.user.salt;

        this.key = await pbkdf2(this.signature, new Buffer(this.salt, 'hex'), 100000, 256 / 8, "sha512");
    }

    openDatastore(name) {
        if (!this.app.user) {
            throw "User not connected";
        }

        if (this._datastores[name]) {
            return this._datastores[name];
        }

        this._datastores[name] = new Datastore(this, name, this.config);

        return this._datastores[name];
    }

    getDataStoreConfig(schemaName, extraConfig) {
        let config = {};
        extraConfig = extraConfig ? extraConfig : {};
        _.merge(config, this.config.datastores.default, extraConfig);

        if (typeof(this.config.datastores[schemaName]) !== 'undefined') {
            _.merge(config, this.config.datastores[schemaName]);
        }

        return config;
    }

    /**
     * Set the credentials for this user
     * 
     * @param {*} username 
     * @param {*} password 
     */
    setCredentials(username, password) {
        this.client.username = username;
        this.client.password = password;
    }

    _getSignMessage() {
        let appName = this.config.isUser ? "Verida Wallet" : this.app.name;
        return "Do you approve access to \""+appName+"\"?\n\n" + this.app.user.did;
    }

}

export default DataServer;