/*eslint no-console: "off"*/
import Datastore from "./datastore";
import Client from "./client";
import _ from 'lodash';
import Database from './database';
import App from './app';
import crypto from 'crypto';
import Utils from './utils';

class DataServer {

    constructor(config) {
        let defaults = {
            datastores: {}
        };
        this.config = _.merge(defaults, config);

        this.appName = config.appName ? config.appName : App.config.appName;
        this.appHost = config.appHost ? config.appHost : App.config.appHost;
        this.dbManager = config.dbManager;
        this.serverUrl = config.serverUrl;
        this.isProfile = config.isProfile ? config.isProfile : false;

        this._client = new Client(this);

        // By default, dataserver access is public only
        this._publicCredentials = null;
        this._datastores = {};  // @todo: difference if public v nonpublic?

        this._user = null;
        this._keyring = null;
        this._vid = null;
        this._dsn = null;
    }

    /**
     * Authorize a user to have full permissions to this dataserver
     * 
     * @param {*} force 
     */
    async connect(user, force) {
        if (this._userConfig && this._userConfig) {
            return true;
        }

        let userConfig = await user.getAppConfig(this.appName, force);
        if (!userConfig) {
            return false;
        }
        
        // NOTE: removed the isProfile check. see user.requestSignature
        
        let dsUser = await this._getUser(user, userConfig.keyring.signature);

        this._keyring = userConfig.keyring;
        this._vid = userConfig.vid;
        this._dsn = dsUser.dsn;

        // configure client
        this._client.username = user.did;
        this._client.signature = userConfig.keyring.signature;
        
        this._user = user;
        return true;
    }

    /**
     * Load an external data server
     */
    async loadExternal(config) {
        this._vid = config.vid;
    }

    logout() {
        this._connected = false;
        this._user.logout(this.appName);
    }

    async getPublicCredentials() {
        if (this._publicCredentials) {
            return this._publicCredentials;
        }

        let response = await this._client.getPublicUser();
        this._publicCredentials = response.data.user;
        return this._publicCredentials;
    }

    /**
     * 
     * @param {*} dbName 
     * @param {*} config 
     */
    async openDatabase(dbName, config) {
        if (!dbName) {
            throw new Error("No database name provided");
        }
        
        config = _.merge({
            permissions: {
                read: "owner",
                write: "owner"
            },
            user: this._user,
            did: this.config.did,
            saveDatabase: true
        }, config);

        // If permissions require "owner" access, connect the current user
        if ((config.permissions.read == "owner" || config.permissions.write == "owner") && !config.readOnly) {
            if (!config.readOnly && !config.user) {
                throw new Error("Unable to open database. Permissions require \"owner\" access, but no user supplied in config.");
            }

            await this.connect(config.user, true);
        }

        // Default to user's did if not specified
        let did = config.did;
        if (config.user) {
            did = config.did || config.user.did;
            config.isOwner = (did == (config.user ? config.user.did : false));
        }

        did = did.toLowerCase();

        // @todo Cache databases so we don't open the same one more than once
        let db = new Database(dbName, did, this.appName, this, config);
        await db._init();

        if (config.saveDatabase && db._originalDb) {
            this.dbManager.saveDb(dbName, did, this.appName, config.permissions, db._originalDb.encryptionKey);
        }

        return db;
    }

    async openDatastore(schemaName, config) {
        config = _.merge({
            permissions: {
                read: "owner",
                write: "owner"
            },
            user: this._user,
            did: this.config.did
        }, config);

        // Default to user's did if not specified
        let did = config.did;
        if (config.user) {
            did = config.did || config.user.did;
            config.isOwner = (did == (config.user ? config.user.did : false));
        }

        if (!did) {
            throw new Error("No DID specified in config and no user connected");
        }

        did = did.toLowerCase();

        let datastoreName = config.dbName ? config.dbName : schemaName;

        let dsHash = Utils.md5FromArray([
            datastoreName,
            did,
            config.readOnly ? true : false
        ]);

        if (this._datastores[dsHash]) {
            return this._datastores[dsHash];
        }

        // If permissions require "owner" access, connect the current user
        if ((config.permissions.read == "owner" || config.permissions.write == "owner") && !(config.readOnly === true)) {
            if (!config.user) {
                throw new Error("Unable to open database. Permissions require \"owner\" access, but no user supplied in config.");
            }

            await this.connect(config.user, true);
        }

        this._datastores[dsHash] = new Datastore(this, schemaName, did, this.appName, config);

        return this._datastores[dsHash];
    }

    /**
     * Get the default symmetric encryption key
     */
    async getDbKey(user, dbName) {
        if (!this._keyring) {
            await this.connect(user, true);
        }

        return this._keyring.getDbKey(dbName);
    }

    async getClient(user) {
        if (!this._keyring) {
            await this.connect(user, true);
        }

        return this._client;
    }

    async getDsn(user) {
        if (!this._keyring) {
            await this.connect(user, true);
        }

        return this._dsn;
    }

    _generatePassword(signature) {
        return crypto.createHash('sha256').update(signature).digest("hex");
    }

    async _getUser(user, signature) {
        // Fetch user details from server
        let response;
        try {
            this._client.username = user.did;
            this._client.signature = signature;
            response = await this._client.getUser(user.did);
        } catch (err) {
            if (err.response && err.response.data.data && err.response.data.data.did == "Invalid DID specified") {
                // User doesn't exist, so create
                response = await this._client.createUser(user.did, this._generatePassword(signature));
            }
            else if (err.response && err.response.statusText == "Unauthorized") {
                throw new Error("Invalid signature or permission to access DID server");
            }
            else {
                // Unknown error
                throw err;
            }
        }

        return response.data.user;
    }

}

export default DataServer;