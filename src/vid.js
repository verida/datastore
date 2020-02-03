/*eslint no-console: "off"*/
import { DIDDocument } from 'did-document';
import DIDHelper from '@verida/did-helper';

class Vid {

    /**
     * TODO: Replace with decentralised lookup
     * 
     * @param {*} keyring 
     * @param {*} chainDID 
     * @param {*} didServerUrl
     */
    async save(did, appName, appUrl, vid, keyring, didServerUrl, userDataserverUrl) {
        let publicKeys = keyring.exportPublicKeys();

        // Generate a VID Document
        let doc = new DIDDocument({
            did: vid
        });

        doc.addPublicKey({
            id: `${vid}#asymKey`,
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
        return await DIDHelper.commit(did, doc, didServerUrl);

        // Future: Have did-helper include consent message in the proof
        // and have did-server verify the consent message is from a
        // chain address that is linked to the DID (unless it's the only one)?
    }

    async getByDid(did, appName, didServerUrl) {
        return await DIDHelper.loadForApp(did, appName, didServerUrl);
    }

}

let vid = new Vid();
export default vid;