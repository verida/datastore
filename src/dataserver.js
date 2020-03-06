/*eslint no-console: "off"*/
import Datastore from "./datastore";
import Client from "./client";
import Keyring from "./keyring";
import { utils, ethers } from "ethers";
import Consent from "./consent";
import store from 'store';
import vidHelper from './helpers/vid';
import _ from 'lodash';
import Database from './database';
import Config from './config';
import crypto from 'crypto';

const STORAGE_KEY = 'VERIDA_SESSION_';

class DataServer {

    constructor(app, config) {
        this.app = app;
        let defaults = {
            datastores: {}
        };
        this.config = _.merge(defaults, config);

        this.appName = config.appName ? config.appName : app.name;
        this.appHost = config.appHost ? config.appHost : "localhost";
        this.serverUrl = config.serverUrl;
        this.didUrl = config.didUrl;
        this.isProfile = config.isProfile ? config.isProfile : false;

        this._client = new Client(this);
        
        this._keyring = null;
        this._signature = null;
        this._dsn = null;
        this._salt = null;
        this._key = null;

        this._publicCredentials = null;
        this._datastores = {};
        this._init = false;
        this._vid = null;
        this._vidDoc = null;
    }

    async connect(force) {
        // Try to load config from local storage
        this._storageKey = STORAGE_KEY + this.appName + this.app.user.did;
        let config = store.get(this._storageKey);
        if (config) {
            this.unserialize(config);
            this._init = true;
            return true;
        }
        
        /**
         * Force a connection
         */
        if (force) {
            this._signature = await Consent.requestSignature(this.app.user, this.isProfile ? "profile" : "default", this.isProfile ? Config.vaultAppName : this.appName);
            let user = await this._getUser();
            
            config = {
                signature: this._signature,
                dsn: user.dsn,
                salt: user.salt
            };

            this.unserialize(config);
            store.set(this._storageKey, this.serialize());
            this._vidDoc = await this.app.user.getAppVid(this.appName);
            
            if (!this._vidDoc) {
                this._vidDoc = await vidHelper.save(this.app.user.did, this.appName, this.app.config.didServiceUrl, this._keyring, this.didUrl, this.serverUrl);
            }

            this._vid = this._vidDoc.id;
            this._init = true;
            return true;
        }

        return false;
    }

    /**
     * Load an external data store (only requires limited fields)
     * 
     * TODO: Refactor into two types of dataservers (the current user's and external)
     */
    async loadExternal(config) {
        this._vid = config.vid;
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
            publicCredentials: this._publicCredentials,
            vid: this._vid
        };
    }

    unserialize(data) {
        let user = this.app.user;
        this._signature = data.signature;

        // configure client
        this._client.username = user.did;
        this._client.signature = this._signature;

        // build keyring
        const entropy = utils.sha256('0x' + this._signature.slice(2));
        const seed = ethers.HDNode.mnemonicToSeed(ethers.HDNode.entropyToMnemonic(entropy));
        this._keyring = new Keyring(seed);

        this._dsn = data.dsn;
        this._salt = data.salt;
        this._key = this._keyring.symKey;
        this._publicCredentials = data.publicCredentials;
        this._vid = data.vid;
    }

    async _getUser() {
        let user = this.app.user;

        // Fetch user details from server
        let response;
        try {
            this._client.username = user.did;
            this._client.signature = this._signature;
            response = await this._client.getUser(user.did);
        } catch (err) {
            if (err.response && err.response.data.data && err.response.data.data.did == "Invalid DID specified") {
                // User doesn't exist, so create
                response = await this._client.createUser(user.did, this._generatePassword(this._signature));
            }
            else {
                // Unknown error
                throw err;
            }
        }

        return response.data.user;
    }

    async getPublicCredentials() {
        if (this._publicCredentials) {
            return this._publicCredentials;
        }

        let response = await this._client.getPublicUser();

        this._publicCredentials = response.data.user;

        return this._publicCredentials;
    }

    async openDatabase(dbName, did, config) {
        config = config ? config : {};
        config.permissions = config.permissions ? config.permissions : {};

        // If permissions require "owner" access, connect the current user
        if (config.permissions.read == "owner" || config.permissions.write == "owner") {
            if (!this._init) {
                await this.connect(true);
            }
        }

        // Default to user's did if not specified
        did = did ? did : this.app.user.did;

        config.isOwner = (did == this.app.user.did);

        // TODO: Cache databases so we don't open the same one more than once
        let keyring = await this.app.dataserver.getKeyring();
        return new Database(dbName, did, this.appName, this, keyring, config);
    }

    async openDatastore(schemaName, did, config) {
        config = config ? config : {};
        config.permissions = config.permissions ? config.permissions : {};

        let datastoreName = config.dbName ? config.dbName : schemaName;

        if (this._datastores[datastoreName]) {
            return this._datastores[datastoreName];
        }

        // If permissions require "owner" access, connect the current user
        if (config.permissions.read == "owner" || config.permissions.write == "owner") {
            if (!this._init) {
                await this.connect(true);
            }
        }

        // merge config with this.config?

        // Default to user's did if not specified
        did = did ? did : this.app.user.did;

        config.isOwner = (did == this.app.user.did);
        this._datastores[datastoreName] = new Datastore(this, schemaName, did, this.appName, config);

        return this._datastores[datastoreName];
    }

    async getKey() {
        if (!this._init) {
            await this.connect(true);
        }

        return this._key;
    }

    async getHash() {
        if (!this._init) {
            await this.connect(true);
        }

        return this._hash;
    }

    async getSignature() {
        if (!this._init) {
            await this.connect(true);
        }

        return this._signature;
    }

    async getClient() {
        if (!this._init) {
            await this.connect(true);
        }

        return this._client;
    }

    async getDsn() {
        if (!this._init) {
            await this.connect(true);
        }

        return this._dsn;
    }

    async getKeyring() {
        if (!this._init) {
            await this.connect(true);
        }

        return this._keyring;
    }

    _generatePassword() {
        return crypto.createHash('sha256').update(this._signature).digest("hex");
    }

}

export default DataServer;