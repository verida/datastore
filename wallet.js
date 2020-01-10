import Datastore from "./datastore";
import Profile from "./profile";

const _ = require('lodash');

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
    openDataStore(name, config) {
        return new Datastore(name, this._app.user.did, "Verida Wallet", this._app.dataservers.user, config);
    }

}

export default Wallet;