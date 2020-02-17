/*eslint no-unused-vars: "off"*/
/*eslint no-console: "off"*/
const crypto = require('crypto');
const uuidv1 = require('uuid/v1');
const EventEmitter = require('events');
const _ = require('lodash');

import EncryptedDatabase from "./databases/encrypted";
import PublicDatabase from "./databases/public";

class Database extends EventEmitter {

    /**
     * Create a new database.
     * 
     * **Do not instantiate directly.**
     */
    constructor(dbName, did, appName, dataserver, config) {
        super();
        this.dbName = dbName;
        this.did = did;
        this.appName = appName;
        this.dataserver = dataserver;

        this.config = config ? config : {};
        this.permissions = {};

        _.merge(this.permissions, {
            read: "owner",
            write: "owner",
            readUsers: [],
            writeUsers: []
        }, this.config.permissions ? this.config.permissions : {});

        this.readOnly = this.config.readOnly ? true : false;
        this.syncToWallet = this.config.syncToWallet ? true : false;

        this._dbHash = null;
        this._db = null;
    }

    // DID + AppName + DB Name + readPerm + writePerm
    getDatabaseHash() {
        if (this._dbHash) {
            return this._dbHash;
        }

        let text = [
            this.did,
            this.appName,
            this.dbName,
            this.permissions.read,
            this.permissions.write
        ].join("/");

        let hash = crypto.createHmac('sha256',"");
        hash.update(text);
        this._dbHash = "v" + hash.digest('hex');

        // Database name must start with a letter
        return this._dbHash;
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
        if (this.readOnly) {
            throw "Unable to save. Read only.";
        }

        let defaults = {};
        options = _.merge(defaults, options);

        let insert = false;

        // Set inserted at if not defined
        // (Assuming it's not defined as we have an insert)
        if (data._id === undefined) {
            insert = true;
        }

        if (insert) {
            this._beforeInsert(data);

            /**
             * Fired before a new record is inserted.
             * 
             * @event Database#beforeInsert
             * @param {object} data Data that was saved
             */
            this.emit("beforeInsert", data);
        } else {
            this._beforeUpdate(data);

            /**
             * Fired before a new record is updated.
             * 
             * @event Database#beforeUpdate
             * @param {object} data Data that was saved
             */
            this.emit("beforeUpdate", data);
        }

        let response = await this._db.put(data, options);

        if (insert) {
            this._afterInsert();

            /**
             * Fired after a new record is inserted.
             * 
             * @event Database#afterInsert
             * @param {object} data Data that was saved
             */
            this.emit("afterInsert", data, response);
        } else {
            this._afterUpdate();

            /**
             * Fired after a new record is updated.
             * 
             * @event Database#afterUpdate
             * @param {object} data Data that was saved
             */
            this.emit("afterUpdate", data, response);
        }

        return response;
    }

    async getMany(filter, options) {
        await this._init();

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
                let docs = await this._db.find(request);
                if (docs) {
                    return docs.docs;
                }
            } catch (err) {
                console.log(err);
            }

            return;
        }
        else {
            let docs = await this._db.allDocs(options);

            if (docs) {
                return docs.rows;
            }

            return;
        }
    }

    async delete(doc, options) {
        if (this.readOnly) {
            throw "Unable to delete. Read only.";
        }
        
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

    async get(docId, options) {
        await this._init();

        let defaults = {};
        options = _.merge(defaults, options);

        return await this._db.get(docId, options);
    }

    async _init() {
        if (this._db) {
            return;
        }

        // private data (owner, owner) -- use private
        // public profile (readOnly) -- use public
        // public inbox (public, private) -- is that even possible? may need to be public, public
        // group data -- (users, users)

        if (this.permissions.read == "owner" && this.permissions.write == "owner") {
            // Create encrypted database
            try {
            let db = new EncryptedDatabase(this.getDatabaseHash(), this.dataserver, this.did, this.permissions);
            this._db = await db.getDb();
            } catch (err) {
                throw new Error("Error creating database ("+this.dbName+"): " + err.message);
            }
        } else if (this.permissions.read == "public") {
            // Create non-encrypted database
            try {
                let db = new PublicDatabase(this.getDatabaseHash(), this.dataserver, this.did, this.permissions, this.config.isOwner);
                this._db = await db.getDb();
            } catch (err) {
                throw new Error("Error creating database ("+this.dbName+"): " + err.message);
            }
        } else if (this.permissions.read == "users") {
            throw "User group permissions are not yet supported";
        }
        else {
            throw "Unknown database permissions requested";
        }
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

    /**
     * Get the underlying PouchDB instance associated with this database.
     * 
     * @see {@link https://pouchdb.com/api.html#overview|PouchDB documentation}
     * @returns {PouchDB}
     */
    async getInstance() {
        await this._init();
        return this._db;
    }

}

 export default Database;