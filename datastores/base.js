/*eslint no-unused-vars: "off"*/
/*eslint no-console: "off"*/

import Config from '../config';
const uuidv1 = require('uuid/v1');
const EventEmitter = require('events');
const _ = require('lodash');
const crypto = require('crypto');

/**
 * Abstract base class for a DataStore instance
 * 
 * This class must be extended with getDb() implemented at a minimum
 */
class Base extends EventEmitter {

    constructor(dbName, user, app) {
        super();
        this.dbName = dbName;
        this._user = user;          // TODO: move to class
        this._app = app;            // TODO: move to class
        this._config = Config;
        this._dbHash = null;
    }

    /**
     * Create a database hash based on the user's DID,
     * the application name and the database name.
     */
    getDatabaseHash() {
        if (this._dbHash) {
            return this._dbHash;
        }

        let text = this._user.did + '/' + this._app.name + '/' + this.dbName;
        let hash = crypto.createHmac('sha256', this._app.name + "/" + this._config.dbHashKey);
        hash.update(text);
        this._dbHash = hash.digest('hex');

        // Database name must start with a letter
        return "v"+this._dbHash;
    }

    /**
     * Save a new record.
     * 
     * Automatically generates a UUID _id if an insert.
     * Automatically 
     * 
     * @param {*} data 
     * @param {*} options 
     */
    async save(data, options) {
        let defaults = {};
        options = _.merge(defaults, options);
        
        let db = await this.getDb();

        let insert = false;

        // Set inserted at if not defined
        // (Assuming it's not defined as we have an insert)
        if (data._id === undefined) {
            insert = true;
        }

        if (insert) {
            this._beforeInsert(data);
            this.emit("beforeInsert", data);
        } else {
            this._beforeUpdate(data);
            this.emit("beforeUpdate", data);
        }

        let response = await db.put(data, options);

        if (insert) {
            this._afterInsert();
            this.emit("afterInsert", data, response);
        } else {
            this._afterUpdate();
            this.emit("afterUpdate", data, response);
        }

        return response;
    }

    /**
     * 
     * @param {*} filter 
     * @param {*} options 
     */
    async getMany(filter, options) {
        let db = await this.getDb();

        let defaults = {
            include_docs: true,
            sort: [],
            limit: 20
        }

        options = _.merge(defaults, options);
        
        if (filter) {
            let request = {
                selector: filter,
            };

            if (options.sort.length) {
                request.sort = options.sort;
            }

            if (options.limit) {
                request.limit = options.limit;
            }

            try {
                let docs = await db.find(request);
                if (docs) {
                    return docs.docs;
                }
            } catch (err) {
                console.log(err);
            }

            return;
        }
        else {
            let docs = await db.allDocs(options);

            if (docs) {
                return docs.rows;
            }

            return;
        }
    }

    /**
     * 
     * @param {*} schema 
     * @param {*} id 
     */
    async delete(doc, options) {
        let defaults = {};
        options = _.merge(defaults, options);

        if (typeof(doc) === "string") {
            // Document is a string representing a document ID
            // so fetch the actual document
            doc = await this.get(doc);
        }

        doc._deleted = true;
        return this.save(doc, options);
    }

    /**
     * 
     * @param {*} schema 
     * @param {*} id 
     */
    async get(docId, options) {
        console.log("get()");
        let db = await this.getDb();

        let defaults = {};
        options = _.merge(defaults, options);

        return await db.get(docId, options);
    }

    /**
     * Get a database.
     * 
     * This must be implemented by the extended implementation
     */
    async getDb() {
        throw new Error("getDB() must be implemented");
    }

    _beforeInsert(data) {
        data._id = uuidv1();
        data.insertedAt = (new Date()).toISOString();
        data.modifiedAt = (new Date()).toISOString();
    }

    _beforeUpdate(data) {
        data.modifiedAt = (new Date()).toISOString();
    }


    _afterInsert(data, response) {}


    _afterUpdate(data, response) {}

}

export default Base;