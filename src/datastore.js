/*eslint no-console: "off"*/
import App from './app';
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
     * @example <caption>Binding to database changes</caption>
     * // open datastore and fetch database
     * let datastore = await app.openDataStore("employment");
     * let db = datastore.getDb();
     * 
     * // fetch underlying PouchDB instance (see PouchDB docs)
     * let pouch = db.getInstance();
     * pouch.changes({
     *      since: 'now',
     *      live: true,
     *      include_docs: true
     *  }).on('change', function() {
     *      console.log("Data has changed in the database");
     *  });
     * @example <caption>Binding to database events</caption>
     * let datastore = await app.openDataStore("employment");
     * let db = datastore.getDb();
     * 
     * db.on("afterInsert", function(data, response) {
     *  console.log("afterInsert() fired");
     *  console.log("Saved data", data);
     * }
     */
    constructor(dataserver, schemaName, did, appName, config) {
        this._dataserver = dataserver;
        this._app = this._dataserver.app;

        this.schemaName = schemaName;
        this.schemaPath = null;
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

        data.schema = this.schemaPath;
        let valid = await this.schema.validate(data);

        if (!valid) {
            this.errors = this.schema.errors;
            return false;
        }
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

        let filter = _.merge({
            schema: this.schemaPath
        }, customFilter);

        return this._db.getMany(filter, options);
    }

    async getOne(customFilter, options) {
        let results = await this.getMany(customFilter, options);
        if (results && results.length) {
            return results[0];
        }
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

    getDataserver() {
        return this._dataserver;
    }

    /**
     * Bind to changes to this datastore
     * 
     * @param {functino} cb Callback function that fires when new data is received
     */
    async changes(cb) {
        const db = await this.getDb();
        const dbInstance = await db.getInstance();
        dbInstance.changes({
            since: 'now',
            live: true
        }).on('change', async function(info) {
            cb(info);
        });
    }

    async _init() {
        if (this._db) {
            return;
        }

        this.schema = await App.getSchema(this.schemaName);
        let schemaJson = await this.schema.getSchemaJson();
        let dbName = this.config.dbName ? this.config.dbName : schemaJson.database.name;
        this.schemaPath = this.schema.path;

        let config = _.merge({
            appName: this.appName,
            did: this.did
        }, this.config);

        this._db = await this._dataserver.openDatabase(dbName, config);
        let indexes = schemaJson.database.indexes;

        if (indexes) {
            await this.ensureIndexes(indexes);
        }
    }

    // TODO: Support removing indexes that were deleted from the spec
    // TODO: Validate indexes
    async ensureIndexes(indexes) {
        for (var indexName in indexes) {
            let indexFields = indexes[indexName];
            let db = await this._db.getInstance();
            await db.createIndex({
                fields: indexFields,
                name: indexName
            });
        }
    }

}

export default DataStore;