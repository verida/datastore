/*eslint no-console: "off"*/
"use strict"

import Base from "./base";

import PouchDBCrypt from 'pouchdb-browser';
import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import Utils from "../utils";

PouchDBCrypt.plugin(PouchDBFind);
PouchDB.plugin(PouchDBFind);

const CryptoPouch = require('crypto-pouch');
PouchDBCrypt.plugin(CryptoPouch);

/*
 * DataStore that is private.
 *
 * All data is encrypted using the user's encryption keys.
 */
class Private extends Base {

    constructor(dbName, dataserver, config) {
        super(dbName, dataserver, config);

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
        this._localDb.crypto(this._dataserver.signature, {
            "key": this._dataserver.key,
            cb: function(err) {
                if (err) {
                    console.error('Unable to connect to local DB');
                    console.error(err);
                }
            }
        });

        this._remoteDbEncrypted = new PouchDB(this._dataserver.dsn + databaseName);
        
        try {
            await this._remoteDbEncrypted.info();
        } catch(err) {
            await this._dataserver.client.createDatabase(this._app.user.did, databaseName);
            // There's an odd timing issue that needs a deeper investigation
            await Utils.sleep(1000);
        }

        // Start syncing the local encrypted database with the remote encrypted database
        PouchDB.sync(this._localDbEncrypted, this._remoteDbEncrypted, {
            live: true,
            retry: true
        }).on("error", function(err) {
            console.log("sync error");
            console.log(err);
        }).on("denied", function(err) {
            console.log("denied error");
            console.log(err);
        });
    }

    async getDb() {
        if (!this._localDb) {
            await this._init();
        }

        return this._localDb;
    }
}

export default Private;