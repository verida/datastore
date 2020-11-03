/*eslint no-console: "off"*/
import { DIDDocument } from 'did-document';
import DIDHelper from '@verida/did-helper/src/DIDHelper';
import { utils } from 'ethers';
import App from '../app';

class VidHelper {

    /**
     * Save a DID document
     *
     * @todo: Replace with decentralised DID management (ie: sidetree)
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

        doc = DIDHelper.createProof(doc, keyring.signKey.private);

        let response = await DIDHelper.commit(did, doc, signature, App.config.server.didServerUrl);
        if (response) {
            return doc;
        }
    }

    /**
     * Get a DID Document for the VID by DID and application name
     *
     * @param {*} did Blockchain DID (ie: did:ethr:0x...)
     * @param {*} appName Application name
     */
    async getByDid(did, appName) {
        appName = appName || App.config.appName;
        did = did.toLowerCase();
        return await DIDHelper.loadForApp(did, appName, App.config.server.didServerUrl);
    }

    /**
     * Get a DID Document representing the VID
     *
     * @param {string} vid VID to locate
     */
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
        return 'did:verida:' + utils.id(appName + did);
    }

    /**
     * Convert a VID to the underlying DID and application name
     *
     * @param {*} vid
     */
    async convertVid(vid) {
        const didDoc = await this.getByVid(vid);
        const applicationService = didDoc.service.find(entry => entry.type.includes("verida.Application"));
        const appName = applicationService.description;
        const did = await this.getDidFromVid(vid);

        return {
            did: did,
            appName: appName
        };
    }

    /**
     * Construct a DID given a chain and address
     *
     * @param {*} address
     * @param {*} chain
     */
    getDidFromAddress(address, chain) {
        chain = chain || "ethr";
        return 'did:'+chain+':'+address.toLowerCase();
    }

    /**
     * Convert a username to a DID
     *
     */
    async getDidFromUsername(username) {
        if (usernameOrDid.match(/^did\:/)) {
            return username;
        }

        return DIDHelper.getDidFromUsername(username, App.config.server.didServerUrl);
    }

    /**
     * Save a username for a given DID. Requires a valid signature signed
     * by the DID.
     *
     * @param {*} username
     * @param {*} did
     * @param {*} signature
     */
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
        verida: resolve
    }
}
