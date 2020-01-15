/*eslint no-console: "off"*/
import Database from "./database";
const _ = require('lodash');

/**
 * A datastore wrapper around a given database and schema.
 * 
 * @property {array} errors Array of most recent errors.
 * @property {string} schemaName Name of the schema used on this Datastore.
 */
class DataStore {

    /**
     * Create a new Datastore.
     * 
     * **Do not instantiate directly.**
     */
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
     * Save data to an application schema.
     * 
     * @param {object} data Data to be saved. Will be validated against the schema associated with this Datastore.
     * @param {object} [options] Database options that will be passed through to [PouchDB.put()](https://pouchdb.com/api.html#create_document)
     * @fires Database#beforeInsert Event fired before inserting a new record
     * @fires Database#beforeUpdate Event fired before updating a new record
     * @fires Database#afterInsert Event fired after inserting a new record
     * @fires Database#afterUpdate Event fired after updating a new record
     * @example
     * let result = await datastore.save({
     *  "firstName": "John",
     *  "lastName": "Doe"
     * });
     * 
     * if (!result) {
     *  console.errors(datastore.errors);
     * } else {
     *  console.log("Successfully saved");
     * }
     * @returns {boolean} Boolean indicating if the save was successful. If not successful `this.errors` will be populated.
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

    /**
     * Fetch a list of records from this Datastore.
     * 
     * Only returns records that belong to this Datastore's schema.
     * 
     * @param {object} [customFilter] Database query filter to restrict the results passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     * @param {object} [options] Database options that will be passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     * @example
     * let results = datastore.getMany({
     *  name: 'John'
     * });
     * 
     * console.log(results);
     */
    async getMany(customFilter, options) {
        await this._init();

        let filter = {};
        _.merge(filter, {
            schema: this.schemaName
        }, customFilter);

        return this._db.getMany(filter, options);
    }

    /**
     * Get a record by ID.
     * 
     * @param {string} key Unique ID of the record to fetch
     * @param {object} [options] Database options that will be passed through to [PouchDB.get()](https://pouchdb.com/api.html#fetch_document)
     */
    async get(key, options) {
        await this._init();
        return this._db.get(key, options);
    }

    /**
     * Delete a record by ID.
     * 
     * @param {string} docId Unique ID of the record to delete
     */
    async delete(docId) {
        await this._init();
        return this._db.delete(docId);
    }

    /**
     * Get the underlying database instance associated with this datastore.
     * 
     * **Note: Do not use unless you know what you're doing as you can easily corrupt a database by breaking schema data.**
     */
    async getDb() {
        await this._init();
        return this._db;
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

        this._db = new Database(dbName, this.did, this.appName, this._dataserver, this.config);
    }

}

export default DataStore;