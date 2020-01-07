/*eslint no-console: "off"*/
"use strict"

import Base from "./base";

import PouchDBCrypt from 'pouchdb-browser';
import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';

PouchDBCrypt.plugin(PouchDBFind);
PouchDB.plugin(PouchDBFind);

const CryptoPouch = require('crypto-pouch');
PouchDBCrypt.plugin(CryptoPouch);
const crypto = require('crypto');

/*
 * DataStore that is private
 */
class Private extends Base {

    constructor(dbName, user, app) {
        super(dbName, user, app);

        // Local copy of the database encrypted
        this._localDbEncrypted = null;

        // Local copy of the database un-encrypted
        this._localDb = null;

        // Remote database connection encrypted
        this._remoteDbEncrypted = null;
    }

    async _init() {
        let databaseName = this.getDatabaseHash();

        this._localDbEncrypted = new PouchDB(databaseName);
        this._localDb = new PouchDBCrypt(databaseName);
        this._localDb.crypto(this._user.password, {
            "key": this._user.key,
            cb: function(err) {
                if (err) {
                    console.error('Unable to connect to local DB');
                    console.error(err);
                }
            }
        });

        this._remoteDbEncrypted = new PouchDB(this._user.dsn + databaseName);

        // TODO:
        //  - implement security checks
        //  - create keyring

        
        try {
            await this._remoteDbEncrypted.info();
        } catch(err) {
            await this._app.client.createDatabase(this._user.did, databaseName);
        }

        // Start syncing the local encrypted database with the remote encrypted database
        PouchDB.sync(this._localDbEncrypted, this._remoteDbEncrypted, {
            live: true,
            retry: true
        });

    }

    async getDb() {
        if (!this._localDb) {
            await this._init();
        }

        return this._localDb;
    }

    /**
     * Create a database hash based on the user's DID,
     * the application name and the database name.
     * 
     * Use the user's password as a key for creating the hash
     * as this is a private DB.
     */
    getDatabaseHash() {
        if (this._dbHash) {
            return this._dbHash;
        }

        let text = this._user.did + '/' + this._app.name + '/' + this.dbName;
        let hash = crypto.createHmac('sha256', this._user.password);
        hash.update(text);
        this._dbHash = hash.digest('hex');

        // Database name must start with a letter
        return "v"+this._dbHash;
    }
}

export default Private;