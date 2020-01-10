/*eslint no-console: "off"*/
import Database from "./database";
const _ = require('lodash');

/**
 * A datastore wrapper around a given database and schema
 */
class DataStore {

    constructor(dataserver, schemaName, did, appName, config) {
        this._dataserver = dataserver;
        this._app = this._dataserver.app;

        this.schemaName = schemaName;
        this.appName = appName;
        this.did = did;
        
        this.errors = {};
        this.config = config;

        this._db = null;
    }

    /**
     * Save data to an application schema
     * 
     * @param {*} data 
     * @param {*} options 
     */
    async save(data, options) {
        await this._init();
        let valid = this.schema.validate(data);

        if (!valid) {
            this.errors = this.schema.errors;
            return false;
        }

        data.schema = this.schemaName;
        return this._db.save(data, options);
    }

    async getMany(customFilter, options) {
        await this._init();

        let filter = {};
        _.merge(filter, {
            schema: this.schemaName
        }, customFilter);

        return this._db.getMany(filter, options);
    }

    async get(key, options) {
        await this._init();
        return this._db.get(key, options);
    }

    async delete(docId) {
        await this._init();
        return this._db.delete(docId);
    }

    async getDb() {
        await this._init();
        return this._db;
    }

    /**
     * Get a datastore by name. Creates a new datastore if it doesn't exist.
     * options.privacy = public,private,restricted
     */
    async _getDatabase(name, dataStoreConfig) {
        let dataStore = null;
        let syncToWallet = dataStoreConfig["syncToWallet"] ? true : false;

        switch (dataStoreConfig.privacy) {
            case "private":
                dataStore = new PrivateDataStore(name, this._dataserver, {
                    syncToWallet: syncToWallet
                });
                break;
            case "public":
                dataStore = new PublicDataStore(name, this._dataserver, {
                    syncToWallet: syncToWallet,
                    useWallet: this.config.useWallet
                });
                break;
        }

        return dataStore;
    }

    async _init() {
        if (this._db) {
            return;
        }

        this.schema = await this._app.getSchema(this.schemaName);

        let specification = await this.schema.getSpecification();
        let dbName = specification.database.name;

        // TODO: How and where to configure app specific datastore configs?
        //let dataStoreConfig = this._dataserver.getDataStoreConfig(this.schemaName);
        //_.merge(dataStoreConfig, this.config);

        this._db = new Database(dbName, this.did, appName, dataserver, config);
    }

}

export default DataStore;