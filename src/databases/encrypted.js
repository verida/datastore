/*eslint no-console: "off"*/

import PouchDB from '@craftzdog/pouchdb-core-react-native';
import PouchDBCrypt from '@craftzdog/pouchdb-core-react-native';
import HttpPouch from 'pouchdb-adapter-http';
import replication from '@verida/pouchdb-replication-react-native';
import mapreduce from 'pouchdb-mapreduce';
import PouchDBFind from 'pouchdb-find';
import SQLite from 'react-native-sqlite-2'
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite';
const SQLiteAdapter = SQLiteAdapterFactory(SQLite);
const CryptoPouch = require('crypto-pouch');
import Utils from "../utils";

PouchDB
  .plugin(HttpPouch)
  .plugin(replication)
  .plugin(mapreduce)
  .plugin(PouchDBFind)
  .plugin(SQLiteAdapter);

PouchDBCrypt
  .plugin(HttpPouch)
  .plugin(replication)
  .plugin(mapreduce)
  .plugin(PouchDBFind)
  .plugin(SQLiteAdapter)
  .plugin(CryptoPouch);

class EncryptedDatabase {

    /**
     *
     * @param {*} dbName
     * @param {*} dataserver
     * @param {string} encryptionKey sep256k1 hex string representing encryption key (0x)
     * @param {*} remoteDsn
     * @param {*} did
     * @param {*} permissions
     */
    constructor(dbHumanName, dbName, dataserver, encryptionKey, remoteDsn, did, permissions) {
        this.dbHumanName = dbHumanName;
        this.dbName = dbName;
        this.dataserver = dataserver;
        this.did = did;
        this.permissions = permissions;
        this.remoteDsn = remoteDsn;
        this.encryptionKey = encryptionKey;

        // PouchDB sync object
        this.sync = null;

        // Automatically convert encryption key to a Buffer if it's a hex string
        if (typeof(this.encryptionKey) == 'string') {
            this.encryptionKey = Buffer.from(encryptionKey.slice(2), 'hex');
        }
    }

    async _init() {
        this._localDbEncrypted = new PouchDB(this.dbName, {
            adapter: 'react-native-sqlite'
        });
        this._localDb = new PouchDBCrypt(this.dbName, {
            adapter: 'react-native-sqlite'
        });

        this._localDb.crypto("", {
            "key": this.encryptionKey,
            cb: function(err) {
                if (err) {
                    throw new Error('Unable to connect to local database');
                }
            }
        });

        this._remoteDbEncrypted = new PouchDB(this.remoteDsn + this.dbName, {
            skip_setup: true
        });

        try {
            let info = await this._remoteDbEncrypted.info();
      
            if (info.error && info.error == "not_found") {
                // Remote dabase wasn't found, so attempt to create it
                await this.createDb();
            }
        } catch (err) {
            if (err.error && err.error == "not_found") {
                // Remote database wasn't found, so attempt to create it
                await this.createDb();
            } else {
                throw new Error('Unknown error occurred attempting to get information about remote encrypted database');
            }
        }

        const humanName = this.dbHumanName;
        const remoteDsn = this.remoteDsn;
        const _localDbEncrypted = this._localDbEncrypted;
        const _remoteDbEncrypted = this._remoteDbEncrypted;
        const parent = this;

        // Do a once off sync to ensure the local database pulls all data from remote server
        // before commencing live syncronisation between the two databases
        await this._localDbEncrypted.replicate.from(this._remoteDbEncrypted)
            .on("error", function(err) {
                console.error("Unknown error occurred with replication snapshot from remote database: " + humanName + " (" + remoteDsn +")");
                console.error(err);
            })
            .on("denied", function(err) {
                console.error("Permission denied with replication snapshot from remote database: " + humanName + " (" + remoteDsn +")");
                console.error(err);
            })
            .on("complete", function(info) {
                // Commence two-way, continuous, retrivable sync
                parent.sync = PouchDB.sync(_localDbEncrypted, _remoteDbEncrypted, {
                    live: true,
                    retry: true,
                    // Dont sync design docs
                    filter: function(doc) {
                        return doc._id.indexOf('_design') !== 0;
                    }
                }).on("error", function(err) {
                    console.error("Unknown error occurred syncing with remote database: " + humanName + " (" + remoteDsn +")");
                    console.error(err);
                }).on("denied", function(err) {
                    console.error("Permission denied to sync with remote database: " + humanName + " (" + remoteDsn +")");
                    console.error(err);
                });
            });
    }

    async createDb() {
        const options = {
            permissions: this.permissions
        };

        const client = await this.dataserver.getClient();
        try {
            await client.createDatabase(this.did, this.dbName, options);
            // There's an odd timing issue that needs a deeper investigation
            await Utils.sleep(1000);
        } catch (err) {
            throw new Error("User doesn't exist or unable to create user database");
        }
    }

    async updateUsers(readList, writeList) {
        this.permissions.readList = readList;
        this.permissions.writeList = writeList;

        const options = {
            permissions: this.permissions
        };

        const client = await this.dataserver.getClient();
        try {
            return client.updateDatabase(this.did, this.dbName, options);
        } catch (err) {
            throw new Error("User doesn't exist or unable to create user database");
        }
    }

    async getDb() {
        if (!this._localDb) {
            await this._init();
        }

        return this._localDb;
    }

}

export default EncryptedDatabase;
