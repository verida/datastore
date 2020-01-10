/*eslint no-unused-vars: "off"*/
/*eslint no-console: "off"*/
/**
 * Permissioned database
 */

const crypto = require('crypto');
const uuidv1 = require('uuid/v1');
const EventEmitter = require('events');
const _ = require('lodash');

import EncryptedDatabase from "databases/encrypted";
import PublicDatabase from "databases/public";

class Database extends EventEmitter {

    constructor(dbName, did, appName, dataserver, config) {
        this.dbName = dbName;
        this.did = did;
        this.appName = appName;
        this.dataserver = dataserver;
        this.config = config;
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

        let hash = crypto.createHmac('sha256', hashKey);
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
            this.emit("beforeInsert", data);
        } else {
            this._beforeUpdate(data);
            this.emit("beforeUpdate", data);
        }

        let response = await this._db.put(data, options);

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

    /**
     * i
     * @param {*} schema 
     * @param {*} id 
     */
    async get(docId, options) {
        await this._init();

        let defaults = {};
        options = _.merge(defaults, options);

        return await this._db.get(docId, options);
    }

    /**
     * Get a database.
     */
    async _init() {
        if (this._db) {
            return this._db;
        }

        // private data (owner, owner) -- use private
        // public profile (readOnly) -- use public
        // public inbox (public, private) -- is that even possible? may need to be public, public
        // group data -- (users, users)

        if (this.permissions.read == "owner" && this.permissions.write == "owner") {
            // Create encrypted database
            this._db = new EncryptedDatabase(this.dbName, this.dataServer, this.did, this.permissions).getDb();
        } else if (this.permissions.read == "public") {
            // Create non-encrypted database
            this._db = new PublicDatabase().getDb(this.dbName, this.dataServer, this.did, this.permissions);
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

}

 export default Database;