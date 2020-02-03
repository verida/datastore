/*eslint no-console: "off"*/
import Dataserver from "./dataserver";
import Datastore from "./datastore";
import _ from "lodash";
import VID from './vid';
import DIDHelper from '@verida/did-helper';
import didJWT from 'did-jwt';
import { box, randomBytes } from "tweetnacl";
import {
  decodeUTF8,
  encodeBase64
} from "tweetnacl-util";

const newAsymNonce = () => randomBytes(box.nonceLength);

class Inbox {

    constructor(app) {
        this._app = app;
        this._dataservers = {};
    }
    
    /**
     * Send a message to a user's application inbox. The message is converted to
     * a DID-JWT, signed by this application user (sender).
     * 
     * The message is then encrypted using the recipients public key and saved
     * to their public inbox with date/time metadata removed.
     * 
     * @param {string} did User's public DID
     * @param {object} data Data to include in the message. Must match a particular
     *  schema or be an array of schema objects
     * @param {config} config Optional config (TBA)
     */
    async send(did, data, config) {
        config = config ? config : {};
        this.validateData(data);

        /**
         * Sign this message from the current application user to create a JWT
         * containing the inbox message
         */
        // Use the current application's keyring as we shouldn't request access to
        // the user's private wallet
        let keyring = await this._app.dataservers.app.getKeyring();
        let signer = didJWT.SimpleSigner(keyring.signKey.private);

        let jwt = await didJWT.createJWT({
            aud: this._app.user.did,
            exp: config.expiry,
            data: data,
            insertedAt: (new Date()).toISOString()
        }, {
            alg: 'ES256K-R',
            issuer: this._app.user.did,
            signer
        });

        // Encrypt this message using the receipients public key
        let vidDoc = await VID.getByDid(did, "Verida Wallet", this._app.config.didServerUrl);
        let publicSignKey = DIDHelper.getSignKeyBytes(vidDoc);

        let encrypted = this.encrypt(jwt, publicSignKey);

        // Save the encrypted JWT to the user's inbox
        let inbox = await this.getDatastore(did);

        // Undo saving of inserted / modified metadata as this DB is public
        let db = await inbox.getDb();

        db.on("beforeInsert", function(data) {
            delete data['insertedAt'];
            delete data['modifiedAt'];
        })

        let response = await inbox.save({
            content: encrypted
        });

        return response;
    }

    async getDatastore(did, config) {
        config = config ? config : {};

        let defaults = {
            appName: "Verida Wallet"
        };
        _.merge(config, defaults, config);

        // Build dataserver connecting to the recipient user's inbox
        let dataserver = await this.getUserDataserver(did, config);
        let inbox = new Datastore(dataserver, "inbox/item", did, config.appName, {
            permissions: {
                read: "public",
                write: "public"
            }
        });

        return inbox;
    }

    /**
     * 
     * @param {*} did 
     * @param {*} config 
     */
    async getUserDataserver(did, config) {
        if (this._dataservers[did]) {
            return this._dataservers[did];
        }

        // Get user's VID to obtain their dataserver address
        let vidDoc = await VID.getByDid(did, "Verida Wallet", this._app.config.didServerUrl);
        let dataserverDoc = vidDoc.service.find(entry => entry.id.includes('dataserver'));
        let dataserverUrl = dataserverDoc.serviceEndpoint;

        let dataserver = new Dataserver(this._app, {
            appName: config.appName ? config.appName : "Verida Wallet",
            isProfile: false,
            serverUrl: dataserverUrl,
            didUrl: this._app.config.didServerUrl
        });
        dataserver.loadExternal({
            vid: vidDoc.id
        });

        this._dataservers[did] = dataserver;
        return this._dataservers[did];
    }

    encrypt(data, secretOrSharedKey) {
        secretOrSharedKey = secretOrSharedKey ? secretOrSharedKey : this.asymKey.publicBytes;
        const nonce = newAsymNonce();
        const messageUint8 = decodeUTF8(JSON.stringify(data));
        const encrypted = box.after(messageUint8, nonce, secretOrSharedKey);

        const fullMessage = new Uint8Array(nonce.length + encrypted.length);
        fullMessage.set(nonce);
        fullMessage.set(encrypted, nonce.length);

        const base64FullMessage = encodeBase64(fullMessage);
        return base64FullMessage;
    }

    /*eslint no-unused-vars: "off"*/
    validateData(data) {
        // TODO: Validate the data is a valid schema (or an array of valid schemas)
        return true;
    }

}

export default Inbox;