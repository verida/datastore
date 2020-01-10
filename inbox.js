import Datastore from "./datastore";

class Inbox {

    constructor(app) {
        this._app = app;
    }

    /**
     * Add a message to a user's inbox
     * 
     * @param {string} name 
     */
    add(messageType, data) {
        await this._init();

        // TODO: validate data against schema of `messageType`
        // TODO: encrypt data with user's public key

        let db = this._store.getDb();
        return db.put(data);
    }

    async _init() {
        if (this._initialised) {
            return;
        }

        this._store = new Datastore("inbox", this._app.user.did, "Verida Wallet", this._app.dataservers.public, {
            permissions: {
                write: "public",
                read: "public"
            }
        });
    }

}

export default Wallet;