import Datastore from "./datastore";

class Inbox {

    constructor(app) {
        this._app = app;
    }

    async add(messageType, data) {
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

        return this._app.dataservers.user.openDatastore("inbox", this._app.user.did, {
            permissions: {
                write: "public",
                read: "public"
            }
        });
    }

}

export default Wallet;