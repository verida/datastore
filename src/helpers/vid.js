/*eslint no-console: "off"*/
import { DIDDocument } from 'did-document';
import DIDHelper from '@verida/did-helper';
import { utils } from 'ethers';
import App from '../app';

class VidHelper {

    /**
     * Save a DID document
     * 
     * @todo: Replace with decentralised lookup
     */
    async save(did, appName, keyring, userDataserverUrl, signature) {
        let vid = this.getVidFromDid(did, appName);
        let publicKeys = keyring.exportPublicKeys();
        let appUrl = App.config.appHost;

        // Generate a VID Document
        let doc = new DIDDocument({
            did: vid
        });

        doc.addPublicKey({
            id: `${vid}#asym`,
            type: 'Curve25519EncryptionPublicKey',
            publicKeyHex: publicKeys.asymmetric,
            publicKeyBase64: publicKeys.asymmetricBase64
        });

        doc.addPublicKey({
            id: `${vid}#sign`,
            type: 'ED25519SignatureVerification',
            publicKeyHex: publicKeys.sign,
            publicKeyBase64: publicKeys.signBase64
        });

        doc.addAuthentication({
            publicKey: `${vid}#sign`,
            type: 'ED25519SignatureAuthentication'
        });

        doc.addService({
            id: `${vid}#application`,
            type: 'verida.Application',
            serviceEndpoint: appUrl,
            description: appName
        });

        doc.addService({
            id: `${vid}#dataserver`,
            type: 'verida.DataServer',
            serviceEndpoint: userDataserverUrl
        });

        DIDHelper.createProof(doc, keyring.signKey.private);
        let response = await DIDHelper.commit(did, doc, signature, App.config.server.didServerUrl);
        if (response) {
            return doc;
        }

        // Future: Have did-helper include consent message in the proof
        // and have did-server verify the consent message is from a
        // chain address that is linked to the DID (unless it's the only one)?
    }

    async getByDid(did, appName) {
        appName = appName || App.config.appName;
        did = did.toLowerCase();
        return await DIDHelper.loadForApp(did, appName, App.config.server.didServerUrl);
    }

    async getByVid(vid) {
        vid = vid.toLowerCase();
        return await DIDHelper.load(vid, App.config.server.didServerUrl);
    }

    /**
     * Get DID for a given VID
     * 
     * @param {*} vid
     */
    async getDidFromVid(vid) {
        vid = vid.toLowerCase();
        return await DIDHelper.getDidFromVid(vid, App.config.server.didServerUrl);
    }

    /**
     * Get the VID for a given DID and application name
     * 
     * @param {*} did 
     * @param {*} appName 
     */
    getVidFromDid(did, appName) {
        appName = appName || App.config.appName;
        did = did.toLowerCase();
        return 'did:vid:' + utils.id(appName + did);
    }

    getDidFromAddress(address, chain) {
        chain = chain || "ethr";
        return 'did:'+chain+':'+address.toLowerCase();
    }

    async getDidFromUsername(username) {
        return DIDHelper.getDidFromUsername(username, App.config.server.didServerUrl);
    }

    async commitUsername(username, did, signature) {
        return DIDHelper.commitUsername(username, did, signature, App.config.server.didServerUrl);
    }

}

let vidHelper = new VidHelper();
export default vidHelper;

export function getResolver() {
    async function resolve(vid, parsed, didResolver) {
        return await App.Helpers.vid.getByVid(vid);
    }

    return {
        vid: resolve
    }
}