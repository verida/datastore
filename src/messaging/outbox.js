/*eslint no-console: "off"*/
import Datastore from "../datastore";
import _ from "lodash";
import VidHelper from '../helpers/vid';
import DIDHelper from '@verida/did-helper';
//import didJWT from 'did-jwt';
//import { box, randomBytes } from "tweetnacl";
import App from '../app';
import DIDComm from 'DIDComm-js';

class Outbox {

    constructor(app) {
        this._app = app;
        this._inboxes = {};
        this._outboxDatastore = null;
    }
    
    /**
     * Send a message to another user's application inbox. The message is converted to
     * a DID-JWT, signed by this application user (sender).
     * 
     * The message is then encrypted using the recipients public key and saved
     * to their public inbox with date/time metadata removed.
     * 
     * @param {string} did User's public DID
     * @param {string} type Type of inbox entry (ie: /schemas/base/inbox/type/dataSend)
     * @param {object} data Data to include in the message. Must match a particular
     *  schema or be an array of schema objects
     * @param {string} message Message to show the user describing the inbox message
     * @param {config} config Optional config (TBA). ie: specify `appName` if sending to a specific application
     */
    async send(did, type, data, message, config) {
        message = message ? message : "";
        config = config ? config : {};
        did = did.toLowerCase();

        let defaults = {
            // By default send data to the user's official Verida Vault application
            appName: App.config.vaultAppName
        };
        config = _.merge(defaults, config);

        let sendingAppName = this._app.name;
        let receivingAppName = config.appName;

        this.validateData(type, data);

        let vidDoc = await VidHelper.getByDid(did, receivingAppName);
        if(!vidDoc) {
            throw new Error("Unable to locate VID for "+receivingAppName);
        }

        let userVid = await this._app.user.getAppVid(sendingAppName);

        let outboxEntry = {
            type: type,
            data: data,
            message: message,
            originator: {
                did: this._app.user.did,
                vid: userVid.id,
                app: sendingAppName,
            },
            recipient: {
                did: did,
                vid: String(vidDoc.id),
                app: receivingAppName
            },
            sent: false
        }

        let outbox = await this.getOutboxDatastore();
        let response = await outbox.save(outboxEntry);

        if (!response) {
            console.error(outbox.errors);
            throw new Error("Unable to save to outbox. See error log above.");
        }

        if (response.ok !== true) {
            console.error(outbox.errors);
            throw new Error("Unable to save to outbox. See error log above.");
        }

        // Include the outbox _id and _rev so the recipient user
        // can respond to this inbox message
        outboxEntry._id = response.id;
        outboxEntry._rev = response.rev;

        /**
         * Sign this message from the current application user to create a JWT
         * containing the inbox message
         */
        // Use the current application's keyring as we can't request access to
        // the user's private vault
        let appUserConfig = await this._app.user.getAppConfig();
        let keyring = appUserConfig.keyring;

        // Note: outboxEntry is a signed message, so no need to re-sign

        let publicAsymKey = DIDHelper.getKeyBytes(vidDoc, 'asym');
        let sender = {
            publicKey: keyring.asymKey.publicBytes,
            privateKey: keyring.asymKey.privateBytes,
            keyType: 'ed25519'
        };

        outboxEntry['@id'] = outboxEntry._id + '/' + outboxEntry._rev;
        outboxEntry['@type'] = outboxEntry.schema;

        const didcomm = new DIDComm();
        await didcomm.Ready;
        let encrypted = await didcomm.pack_auth_msg_for_recipients(JSON.stringify(message), [publicAsymKey], sender, false);
        
        /*let signer = didJWT.SimpleSigner(keyring.signKey.private);

        let jwt = await didJWT.createJWT({
            aud: this._app.user.did,
            vid: userVid.id,
            exp: config.expiry,
            data: outboxEntry,
            veridaApp: sendingAppName,
            insertedAt: (new Date()).toISOString()
        }, {
            alg: 'ES256K-R',
            issuer: this._app.user.did,
            signer
        });

        // Encrypt this message using the receipients public key and this apps private key
        let publicAsymKey = DIDHelper.getKeyBytes(vidDoc, 'asym');
        let sharedKey = box.before(publicAsymKey, keyring.asymKey.privateBytes);
        let encrypted = keyring.asymEncrypt(jwt, sharedKey);*/

        // Save the encrypted JWT to the user's inbox
        let inbox = await this.getInboxDatastore(did, {
            appName: receivingAppName
        });

        // Undo saving of inserted / modified metadata as this DB is public
        let db = await inbox.getDb();

        db.on("beforeInsert", function(data) {
            delete data['insertedAt'];
            delete data['modifiedAt'];
        })

        response = await inbox.save({
            content: encrypted,
            key: keyring.asymKey.public
        });

        // Update outbox entry as saved
        outboxEntry.sent = true;

        response = await outbox.save(outboxEntry);

        return response;
    }

    /**
     * Get the inbox Datastore for a user by DID (and 
     * optionally application name)
     * 
     * @param {string} did User's public DID
     * @param {object} config Config to be passed to the dataserver
     */
    async getInboxDatastore(did, config) {
        config = config ? config : {};

        let defaults = {
            appName: App.config.vaultAppName
        };
        config = _.merge(defaults, config);

        let key = did + config.appName;
        if (this._inboxes[key]) {
            return this._inboxes[key];
        }

        // Build dataserver connecting to the recipient user's inbox
        let dataserver = await App.buildDataserver(did, config);
        let inbox = new Datastore(dataserver, "inbox/item", did, config.appName, {
            permissions: {
                read: "public",
                write: "public"
            },
            isOwner: false,
            // Sign data as this user and application
            signUser: this._app.user,
            signAppName: App.config.appName
        });

        this._inboxes[key] = inbox;

        return inbox;
    }

    async getOutboxDatastore() {
        if (!this._outboxDatastore) {
            this._outboxDatastore = this._app.openDatastore("outbox/entry");
        }

        return this._outboxDatastore;
    }

    /*eslint no-unused-vars: "off"*/
    validateData(data) {
        // TODO: Validate the data is a valid schema (or an array of valid schemas)
        return true;
    }

}

export default Outbox;