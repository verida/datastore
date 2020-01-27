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
    async save(vid, keyring, didServerUrl) {
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

        console.log(keyring.signKey.private);
        DIDHelper.createProof(doc, keyring.signKey.private);
        return await DIDHelper.commit(doc, didServerUrl);

        //let result = await DIDHelper.commit(doc, this.host);
        // TODO: Have did-helper include consent message in the proof
        // and have did-server verify the consent message is from a
        // chain address that is linked to the DID (unless it's the only one)
    }

    /*async get(VID) {
        
    }*/

}

let vid = new Vid();
export default vid;