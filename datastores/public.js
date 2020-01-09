/*eslint no-console: "off"*/
"use strict"

import Base from "./base";
import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);
import Utils from "../utils";

/*
 * DataStore that is public to read, but only the user can write
 */
class Public extends Base {

    constructor(dbName, app, config) {
        super(dbName, app, config);

        this._localDb = null;
        this._remoteDb = null;
    }

    async _init() {
        let databaseName = this.getDatabaseHash();

        this._localDb = new PouchDB(databaseName);
        this._remoteDb = new PouchDB(this._app.user.dsn + databaseName, {
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
            let options = {};
            options.publicWrite = this._config.publicWrite ? true : false;
            await this._app.client.createDatabase(this._app.user.did, databaseName, options);
            // There's an odd timing issue that needs a deeper investigation
            await Utils.sleep(1000);
        }

        // Start syncing the local encrypted database with the remote encrypted database
        PouchDB.sync(this._localDb, this._remoteDb, {
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

export default Public;