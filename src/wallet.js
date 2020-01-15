import Profile from "./profile";

/**
 * @property {Profile} profile The public profile of this wallet
 */
class Wallet {

    /**
     * Create a new wallet
     * 
     * **Do not instantiate directly.**
     * 
     * Access via {@link App.wallet}
     * 
     * @constructor
     */
    constructor(app) {
        this._app = app;

        this.profile = new Profile(app);
    }

    /**
     * Open a datastore for a user's wallet
     * 
     * @param {string} name 
     */
    async openDataStore(name, config) {
        return this._app.dataservers.user.openDatastore(name, this._app.user.did, config);
    }

}

export default Wallet;