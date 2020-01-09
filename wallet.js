import Datastore from "./datastore";
import Profile from "./profile";

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
    openDataStore(name) {
        return new Datastore(this._app, name, {
            privacy: "public",
            syncToWallet: true
        });
    }

}

export default Wallet;