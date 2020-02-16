/*eslint no-console: "off"*/

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);
import Utils from "../utils";

class PublicDatabase {

    constructor(dbName, dataserver, did, permissions, isOwner) {
        this.dbName = dbName;
        this.dataserver = dataserver;
        this.did = did;
        this.permissions = permissions;
        this.isOwner = isOwner;
    }

    async _init() {
        let dsn;

        // If the current application user is the owner of this database, request
        // consent from the user for full access. Otherwise, use public credentials
        // to access the database.
        if (this.isOwner) {
            dsn = await this.dataserver.getDsn();
        } else {
            let publicCreds = await this.dataserver.getPublicCredentials();
            dsn = publicCreds.dsn;
        }
        
        if (!dsn) {
            throw "Unable to locate DSN for database ("+this.dbName+")";
        }
        
        this._remoteDb = new PouchDB(dsn + this.dbName, {
            cb: function(err) {
                if (err) {
                    console.error('Unable to connect to remote DB');
                    console.error(err);
                }
            },
            skip_setup: true
        });

        try {
            let info = await this._remoteDb.info();
            if (info.error && info.error == "not_found") {
                console.log("public db not found!");
                await this.createDb();
            }
        } catch(err) {
            console.log(err);
            await this.createDb();
        }
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
        if (!this._remoteDb) {
            await this._init();
        }

        return this._remoteDb;
    }

}

export default PublicDatabase;