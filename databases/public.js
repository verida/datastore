/*eslint no-console: "off"*/

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);
import Utils from "../utils";

class PublicDatabase {

    constructor(dbName, dataserver, did, permissions) {
        this.dbName = dbName;
        this.dataserver = dataserver;
        this.did = did;
        this.permissions = permissions;
    }

    async _init() {
        let dsn = await this.dataserver.getDsn();
        
        this._remoteDb = new PouchDB(dsn + this.dbName, {
            cb: function(err) {
                if (err) {
                    console.error('Unable to connect to remote DB');
                    console.error(err);
                }
            }
        });

        try {
            await this._remoteDb.info();
        } catch(err) {
            let options = {
                permissions: this.permissions
            };

            let client = await this.dataserver.getClient();
            await client.createDatabase(this.did, this.dbName, options);
            // There's an odd timing issue that needs a deeper investigation
            await Utils.sleep(1000);
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