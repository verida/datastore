/*eslint no-console: "off"*/
import { encodeBase64 } from "tweetnacl-util";
const _ = require('lodash');

import Datastore from "./datastore";
import Client from "./client";
import Keyring from "./keyring";
import { utils, ethers } from "ethers";

const STORAGE_KEY = 'VERIDA_SESSION_';
import store from 'store';

class DataServer {

    constructor(app, config) {
        this.app = app;
        this.config = {
            datastores: {}
        };
        _.merge(this.config, config);

        this.appName = config.appName ? config.appName : app.name;
        this.appHost = config.appHost ? config.appHost : "localhost";
        this.serverUrl = config.serverUrl;
        this.hashKey = config.dbHashKey ? config.dbHashKey : "";

        this._client = new Client(this);
        this._storageKey = STORAGE_KEY + this.appName;
        
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
        // Try to load config from local storage
        let config = store.get(this._storageKey);
        if (config) {
            this.unserialize(config);
        } else {
            this._signature = await this._requestAccess();
            let user = await this._getUser();
            
            config = {
                signature: this._signature,
                dsn: user.dsn,
                salt: user.salt
            };

            this.unserialize(config);
            store.set(this._storageKey, this.serialize());
        }

        this._init = true;
    }

    logout() {
        store.remove(this._storageKey);
    }

    serialize() {
        return {
            signature: this._signature,
            dsn: this._dsn,
            salt: this._salt,
            publicCredentials: this._publicCredentials
        };
    }

    unserialize(data) {
        let user = this.app.user;
        this._signature = data.signature;

        // configure client
        this._client.username = user.did;
        this._client.password = this._signature;

        // build keyring
        const entropy = utils.sha256('0x' + this._signature.slice(2));
        const seed = ethers.HDNode.mnemonicToSeed(ethers.HDNode.entropyToMnemonic(entropy));
        this._keyring = new Keyring(seed);

        // load other data
        this._dsn = data.dsn;
        this._salt = data.salt;
        this._key = this._keyring.asymKey.private;
        this._key64 = encodeBase64(this._key);
        this._publicCredentials = data.publicCredentials;
    }

    async _getUser() {
        let user = this.app.user;

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

        return response.data.user;
    }

    async _requestAccess() {
        let user = this.app.user;
        let web3 = user.web3Provider;
        let signMessage = this._getSignMessage();
        return await web3.eth.personal.sign(signMessage, user.address);
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

    async openDatastore(schemaName, did, config) {
        if (!this._init) {
            await this.connect();
        }

        if (this._datastores[schemaName]) {
            return this._datastores[schemaName];
        }

        // merge config with this.config?

        this._datastores[schemaName] = new Datastore(this, schemaName, did, this.appName, config);

        return this._datastores[schemaName];
    }

    _getSignMessage() {
        return "Do you approve access to view and update \""+this.appName+"\"?\n\n" + this.app.user.did;
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