
import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);
import Utils from "../utils";

class PublicDatabase {

    constructor(databaseName, dataServer, did, permissions) {
        this.databaseName = databaseName;
        this.dataServer = dataServer;
        this.did = did;
        this.permissions = permissions;
    }

    async init() {
        this._remoteDb = new PouchDB(this.dataserver.dsn + this.databaseName, {
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

            await this._dataserver.client.createDatabase(this.did, this.databaseName, options);
            // There's an odd timing issue that needs a deeper investigation
            await Utils.sleep(1000);
        }
    }

    async getDb() {
        if (!this._localDb) {
            await this._init();
        }

        return this._localDb;
    }

}

export default PublicDatabase;