/*eslint no-console: "off"*/
import PrivateDataStore from "./datastores/private";
import PublicDataStore from "./datastores/public";
const _ = require('lodash');

/**
 * A datastore wrapper around a given database and schema
 */
class Datastore {

    constructor(dataserver, schemaName, config) {
        this._dataserver = dataserver;
        this._app = this._dataserver.app;
        this.name = schemaName;
        this.errors = {};
        this.config = config;

        this._store = null;
        this._initialised = false;
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

        data.schema = this.name;
        return this._store.save(data, options);
    }

    async getMany(customFilter, options) {
        await this._init();

        let filter = {};
        _.merge(filter, {
            schema: this.name
        }, customFilter);

        return this._store.getMany(filter, options);
    }

    async get(key, options) {
        await this._init();
        return this._store.get(key, options);
    }

    async delete(docId) {
        await this._init();
        return this._store.delete(docId);
    }

    async getDb() {
        await this._init();
        return this._store.getDb();
    }

    /**
     * Get a datastore by name. Creates a new datastore if it doesn't exist.
     * options.privacy = public,private,restricted
     */
    async _getDataStore(name, dataStoreConfig) {
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
        if (this._initialised) {
            return;
        }

        this.schema = await this._app.getSchema(this.name);

        let specification = await this.schema.getSpecification();
        let databaseName = specification.database.name;
        let dataStoreConfig = this._dataserver.getDataStoreConfig(this.name);
        _.merge(dataStoreConfig, this.config);
        this._store = await this._getDataStore(databaseName, dataStoreConfig);
    }

}

export default Datastore;