/*eslint no-console: "off"*/
import { DIDDocument } from 'did-document';
import DIDHelper from '@verida/did-helper';
import { utils } from 'ethers';

class VidHelper {

    getVidFromDid(did, appName) {
        did = did.toLowerCase();
        return 'did:vid:' + utils.id(appName + did);
    }

    /**
     * TODO: Replace with decentralised lookup
     * 
     */
    async save(did, appName, appUrl, keyring, didServerUrl, userDataserverUrl) {
        let vid = this.getVidFromDid(did, appName);
        let publicKeys = keyring.exportPublicKeys();

        // Generate a VID Document
        let doc = new DIDDocument({
            did: vid
        });

        doc.addPublicKey({
            id: `${vid}#asym`,
            type: 'Curve25519EncryptionPublicKey',
            publicKeyHex: publicKeys.asymmetric
        });

        doc.addPublicKey({
            id: `${vid}#sign`,
            type: 'Secp256k1VerificationKey2018',
            publicKeyHex: publicKeys.sign
        });

        doc.addAuthentication({
            publicKey: `${vid}#sign`,
            type: 'Secp256k1SignatureAuthentication2018'
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
        let response = await DIDHelper.commit(did, doc, didServerUrl);
        if (response) {
            return doc;
        }

        // Future: Have did-helper include consent message in the proof
        // and have did-server verify the consent message is from a
        // chain address that is linked to the DID (unless it's the only one)?
    }

    async getByDid(did, appName, didServerUrl) {
        did = did.toLowerCase();
        return await DIDHelper.loadForApp(did, appName, didServerUrl);
    }

    async getByVid(vid, didServerUrl) {
        vid = vid.toLowerCase();
        return await DIDHelper.load(vid, didServerUrl);
    }

    async getDidFromVid(vid, didServerUrl) {
        vid = vid.toLowerCase();
        return await DIDHelper.getDidFromVid(vid, didServerUrl);
    }

    async signData(data, app) {
        if (!data.signatures) {
            data.signatures = {};
        }

        let _data = _.merge({}, data);
        delete _data['_signatures'];

        let vid = this.getVidFromDid(app.user.did, app.name);
        let keyring = await app.dataserver.getKeyring();
        data.signatures[vid] = keyring.sign(_data);
        return data;
    }

}

let vidHelper = new VidHelper();
export default vidHelper;