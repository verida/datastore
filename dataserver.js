/*eslint no-console: "off"*/
import { encodeBase64 } from "tweetnacl-util";
const _ = require('lodash');

import Datastore from "./datastore";
import Client from "./client";
import Keyring from "./keyring";
import { utils, ethers } from "ethers";

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

        this._client = new Client(this);
        this._client.hostName = this.appHost;
        
        this._keyring = null;
        this._signature = null;
        this._dsn = null;
        this._salt = null;
        this._key = null;
        this._key64 = null;

        this._publicCredentials = {};
        this._datastores = {};
        this._init = false;
    }

    async connect() {
        let user = this.app.user;
        let web3 = await user.getWeb3Provider();
        let signMessage = this._getSignMessage();
        this._signature = await web3.eth.personal.sign(signMessage, user.address);

        const entropy = utils.sha256('0x' + this._signature.slice(2));
        const seed = ethers.HDNode.mnemonicToSeed(ethers.HDNode.entropyToMnemonic(entropy));

        this._keyring = new Keyring(seed);

        // Fetch user details from server
        let response;
        try {
            this._client.username = user.did;
            this._client.password = this._signature;
            response = await this._client.getUser(user.did);
        } catch (err) {
            if (err.response && err.response.data.data && err.response.data.data.did == "Invalid DID specified") {
                // User doesn't exist, so create
                response = await this._client.createUser(user.did);
            }
            else {
                // Unknown error
                throw err;
            }
        }

        // Populate the rest of this user object
        this._dsn = response.data.user.dsn;
        this._salt = response.data.user.salt;
        this._key = this._keyring.asymKey.private;
        this._key64 = encodeBase64(this._key);
        
        this._init = true;
    }

    async getPublicCredentials() {
        if (this._publicCredentials) {
            return this._publicCredentials;
        }

        let response = await this._client.getPublicUser();

        this._publicCredentials = {
            username: response.data.user.username,
            password: response.data.user.password
        }

        return this._publicCredentials;
    }

    async openDatastore(schemaName, did, appName, config) {
        if (!this._init) {
            await this.connect();
        }

        if (this._datastores[schemaName]) {
            return this._datastores[schemaName];
        }

        // merge config with this.config?

        this._datastores[schemaName] = new Datastore(this, schemaName, did, appName, config);

        return this._datastores[schemaName];
    }

    _getSignMessage() {
        let appName = this.config.isUser ? "Verida Wallet" : this.app.name;
        return "Do you approve access to view and update \""+appName+"\"?\n\n" + this.app.user.did;
    }

    async getKey() {
        if (!this._init) {
            await this.connect();
        }

        return this._key;
    }

    async getHash() {
        if (!this._init) {
            await this.connect();
        }

        return this._hash;
    }

    async getSignature() {
        if (!this._init) {
            await this.connect();
        }

        return this._signature;
    }

    async getClient() {
        if (!this._init) {
            await this.connect();
        }

        return this._client;
    }

    async getDsn() {
        if (!this._init) {
            await this.connect();
        }

        return this._dsn;
    }

}

export default DataServer;