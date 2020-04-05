import { box } from "tweetnacl";
import didJWT from 'did-jwt';
const EventEmitter = require('events');

class Inbox extends EventEmitter {

    constructor(app) {
        super();
        this._app = app;

        this._init = false;

        // TODO: Implement on new message event
    }

    async processAll() {
        await this.init();
        
        let items = await this._publicInbox.getMany();
        if (items.length == 0) {
            return 0;
        }

        let manager = this;
        let count = 0;
        items.forEach(item => {
            manager.processItem(item);
            count++;
        });

        return count;
    }

    async processItem(inboxItem) {
        await this.init();
        
        // Build the shared key using this user's private asymmetric key
        // and the user supplied public key
        let appUserConfig = await this._app.user.getAppConfig();
        let keyring = appUserConfig.keyring;
        let publicKeyBytes = Buffer.from(inboxItem.key.slice(2), 'hex');
        let sharedKeyEnd = box.before(publicKeyBytes, keyring.asymKey.privateBytes);

        // Decrypt the inbox/tem to obtain the JWT
        let jwt;
        try {
            jwt = keyring.asymDecrypt(inboxItem.content, sharedKeyEnd);
        } catch (err) {
            console.error("Unable to decrypt inbox item:");
            console.error(err);
            return;
        }

        let decoded = didJWT.decodeJWT(jwt);
        let item = decoded.payload;

        // TODO: Verify the DID-JWT with a custom VID resolver

        let inboxEntry = {
            _id: inboxItem._id, // Use the same _id to avoid duplicates
            message: item.data.message,
            type: item.data.type,
            sentAt: item.insertedAt,
            data: item.data.data,
            sentBy: {
                did: item.aud,
                vid: item.vid,
                app: item.veridaApp
            },
            read: false
        }

        // Save a new inbox entry into the user's private inbox
        try {
            await this._privateInbox.save(inboxEntry);
        } catch (err) { 
            console.error("Unable to save to private inbox");
            console.error(err);
        }

        try {
            // delete the inbox/item
            await this._publicInbox.delete(inboxItem);
        } catch (err) { 
            console.error("Unable to delete from public inbox");
            console.error(err);
            throw err;
        }

        this.emit("newMessage", inboxEntry);
    }

    async watch() {
        await this.init();
        let inbox = this;

        let db = await this._publicInbox.getDb();
        db = await db.getInstance();
        db.changes({
            since: 'now',
            live: true
        }).on('change', function(info) {
            if (info.deleted) {
                // ignore deleted changes
                return;
            }

            inbox.processAll();
        }).on('error', function(err) {
            console.log("Error watching for inbox changes");
            console.log(err);
        })
    }

    /**
     * Initialise the inbox manager
     */
    async init() {
        if (this._init) {
            return;
        }

        this._init = true;

        let isConnected = await this._app.isConnected();
        if (!isConnected) {
            throw "Verida application isn't connected";
        }

        this._publicInbox = await this._app.openDatastore("inbox/item", {
            permissions: {
                read: "public",
                write: "public"
            }
        });
        
        this._privateInbox = await this._app.openDatastore("inbox/entry", {
            permissions: {
                read: "owner",
                write: "owner"
            }
        });

        await this.watch();
        await this.processAll();
    }

    async getInbox() {
        await this.init();

        return this._privateInbox;
    }

}

export default Inbox;