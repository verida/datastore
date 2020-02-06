/*eslint no-console: "off"*/
/**
 * Public profile for a user.
 */
class Profile {

    /**
     * Create a new user profile.
     * 
     * **Do not instantiate directly.**
     * 
     * Access the current user's profile via {@link App.profile}
     * 
     * @constructor
     */
    constructor(app) {
        this._app = app;
    }

    /**
     * Get a profile value by key
     * 
     * @param {string} key Profile key to get (ie: `email`)
     * @example
     * let emailDoc = app.wallet.profile.get('email');
     * 
     * // key = email
     * // value = john@doe.com
     * console.log(emailDoc.key, emailDoc.value);
     * @return {object} Database record for this profile key. Object has keys [`key`, `value`, `_id`, `_rev`].
     */
    async get(key, options) {
        await this._init();
        return this._store.get(key, options);
    }

    /**
     * 
     * @param {string} key Profile key to delete (ie: `email`)
     * @returns {boolean} Boolean indicating if the delete was successful
     */
    async delete(key) {
        await this._init();
        return this._store.delete(key);
    }

    /**
     * Get many profile values.
     * 
     * @param {object} [customFilter] Database query filter to restrict the results passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     * @param {object} [options] Database options that will be passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     */
    async getMany(filter, options) {
        await this._init();
        return this._store.getMany(filter, options);
    }

    /**
     * Set a profile value by key
     * 
     * @param {string|object} doc Profile key to set (ie: `email`) **OR** an existing profile document obtained from `get()` or getMany()`.
     * @param {*} value Value to save
     * @example
     * // Set a profile value by key
     * app.wallet.profile.set('name', 'John');
     * 
     * // Update a profile value from an existing document
     * let emailDoc = app.wallet.profile.get('email');
     * app.wallet.profile.set(emailDoc, 'john@doe.com');
     * 
     * // Update a profile profile by key
     * app.wallet.profile.set('email', 'john@doe.com');
     * @returns {boolean} Boolean indicating if the save was successful
     */
    async set(doc, value) {
        await this._init();

        if (typeof doc == "string") {
            doc = {
                "_id": doc,
                "key": doc
            }
        }

        // Try to find the original document and do an update if it exists
        if (doc._rev === undefined) {
            try {
                let oldDoc = await this.get(doc._id);
                if (oldDoc) {
                    doc = oldDoc;
                }
            } catch (err) {
                // not found, so let the insert continue
            }
        }

        doc.value = value;
        return this._store.save(doc);
    }

    async _init() {
        if (this._store) {
            return;
        }

        let dataserver = await this._app.buildDataserver(this._app.user.did, {
            appName: "Verida Public Profile"
        });

        this._store = new Datastore(dataserver, "profile", this._app.user.did, "Verida Public Profile", {
            permissions: {
                read: "public",
                write: "owner"
            },
            isOwner: true
        });
    }

    async getDatastore() {
        await this._init();
        return this._store;
    }

}

export default Profile;