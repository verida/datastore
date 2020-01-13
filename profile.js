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
    async set(key, value) {
        await this._init();
        return this._store.save({
            "key": key,
            "value": value
        });
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

}

export default Profile;