/*eslint no-console: "off"*/

import PouchDBCrypt from 'pouchdb';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import Utils from "../utils";

PouchDBCrypt.plugin(PouchDBFind);
PouchDB.plugin(PouchDBFind);

const CryptoPouch = require('crypto-pouch');
PouchDBCrypt.plugin(CryptoPouch);

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
    constructor(dbName, dataserver, encryptionKey, remoteDsn, did, permissions) {
        this.dbName = dbName;
        this.dataserver = dataserver;
        this.did = did;
        this.permissions = permissions;
        this.encryptionKey = encryptionKey;
        this.remoteDsn = remoteDsn;
    }

    async _init() {
        this._localDbEncrypted = new PouchDB(this.dbName);
        this._localDb = new PouchDBCrypt(this.dbName);
        
        let encryptionKey = Buffer.from(this.encryptionKey.slice(2), 'hex');
        
        this._localDb.crypto("", {
            "key": encryptionKey,
            cb: function(err) {
                if (err) {
                    console.error('Unable to connect to local DB');
                    console.error(err);
                }
            }
        });

        this._remoteDbEncrypted = new PouchDB(this.remoteDsn + this.dbName, {
            skip_setup: true
        });
        
        try {
            let info = await this._remoteDbEncrypted.info();
            if (info.error && info.error == "not_found") {
                await this.createDb();
            }
        } catch(err) {
            await this.createDb();
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

    async createDb() {
        let options = {
            permissions: this.permissions
        };

        let client = await this.dataserver.getClient();
        try {
            await client.createDatabase(this.did, this.dbName, options);
            // There's an odd timing issue that needs a deeper investigation
            await Utils.sleep(1000);
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