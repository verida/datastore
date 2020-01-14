import Profile from "./profile";
//const _ = require('lodash');

class Wallet {

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