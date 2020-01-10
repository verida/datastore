
import PouchDBCrypt from 'pouchdb-browser';
import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import Utils from "../utils";

PouchDBCrypt.plugin(PouchDBFind);
PouchDB.plugin(PouchDBFind);

const CryptoPouch = require('crypto-pouch');
PouchDBCrypt.plugin(CryptoPouch);

class EncryptedDatabase {

    constructor(databaseName, dataServer, did, permissions) {
        this.databaseName = databaseName;
        this.dataServer = dataServer;
        this.did = did;
        this.permissions;
    }

    async _init() {
        let databaseName = this.getDatabaseHash();

        this._localDbEncrypted = new PouchDB(this.databaseName);
        this._localDb = new PouchDBCrypt(this.databaseName);
        this._localDb.crypto(this.dataserver.signature, {
            "key": this.dataserver.key,
            cb: function(err) {
                if (err) {
                    console.error('Unable to connect to local DB');
                    console.error(err);
                }
            }
        });

        this._remoteDbEncrypted = new PouchDB(this.dataserver.dsn + this.databaseName);
        
        try {
            await this._remoteDbEncrypted.info();
        } catch(err) {
            let options = {
                permissions: this.permissions
            };

            await this.dataserver.client.createDatabase(this.did, this.databaseName, options);
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

export default EncryptedDatabase;