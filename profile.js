/*eslint no-console: "off"*/
/**
 * Public profile for this user
 */
class Profile {

    constructor(app) {
        this._app = app;
    }

    /**
     * Get a profile value by key
     * 
     * @param {string} key 
     */
    async get(key, options) {
        await this._init();
        return this._store.get(key, options);
    }

    async delete(key) {
        await this._init();
        return this._store.delete(key);
    }

    /**
     * Get many profile values
     * 
     * @param {string} key 
     */
    async getMany(filter, options) {
        await this._init();
        return this._store.getMany(filter, options);
    }

    /**
     * Set a profile value by key
     * 
     * @param {string} key 
     * @param {*} value 
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

    _init() {
        if (this._store) {
            return;
        }

        this._store = this._app.dataservers.app.openDatastore("profile", this._app.user.did, "Verida Wallet", {
            permissions: {
                read: "public",
                write: "owner"
            }
        });
    }

    async getDatastore() {
        await this._init();
        return this._store;
    }

}

export default Profile;