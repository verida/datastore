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
    constructor(datastore) {
        this._store = datastore;
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
    async get(key, options, extended) {
        try {
            let response = await this._store.get(key, options);
            if (!extended) {
                return response.value;
            }

            return response;
        } catch (err) {
            if (err.error == "not_found") {
                return null;
            }

            throw err;
        }
    }

    /**
     * 
     * @param {string} key Profile key to delete (ie: `email`)
     * @returns {boolean} Boolean indicating if the delete was successful
     *
    async delete(key) {
        await this._init();
        return this._store.delete(key);
    }*/

    /**
     * Get many profile values.
     * 
     * @param {object} [customFilter] Database query filter to restrict the results passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     * @param {object} [options] Database options that will be passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     */
    async getMany(filter, options) {
        return this._store.getMany(filter, options);
    }

}

export default Profile;