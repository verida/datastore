/*eslint no-console: "off"*/
import { box, sign } from "tweetnacl";
import {
  encodeBase64
} from "tweetnacl-util";
import { ethers } from 'ethers';
import Encryption from "@verida/encryption-utils";

const BASE_PATH = "m/6696500'/0'/0'";
const DB_PATH = "m/42"
//const ETH_PATH = "m/44'/60'/0'/0"

/**
 * Container for user's encryption keys for an application.
 */
class Keyring {

    /**
     * Create a new Keyring for an application.
     *
     * @ignore
     * @param signature
     */
    constructor(signature) {
        this.signature = signature;

        const entropy = ethers.utils.sha256('0x' + signature.slice(2));
        const seedNode = ethers.utils.HDNode.fromSeed(entropy);
        this.baseNode = seedNode.derivePath(BASE_PATH);

        // Build symmetric key
        let symKey = this.baseNode.derivePath("0");
        this.symKey = Buffer.from(symKey.privateKey.slice(2), 'hex');

        // Build asymmetric keys
        let asymKey = this.baseNode.derivePath("1");
        this.asymKey = this._generateKeyPair(asymKey, "box");

        // Build signing keys
        let signKey = this.baseNode.derivePath("2");
        this.signKey = this._generateKeyPair(signKey, "sign");

        const dbNode = this.baseNode.derivePath("3");
        this.dbSignKey = this._generateKeyPair(dbNode, "sign");
        this.dbSymKeys = {};

        //this.ethKey = seedNode.derivePath(ETH_PATH);
    }

    getDbKey(dbName) {
        if (this.dbSymKeys[dbName]) {
            return this.dbSymKeys[dbName];
        }

        // Sign a consent message using the current db signing key
        const consent = "Authorized to own database: " + dbName;
        const signature = this.sign(consent, this.dbSignKey);
        const signatureBytes = ethers.utils.toUtf8Bytes(signature)

        // Use the signature as entropy to create a new seed
        const entropy = ethers.utils.keccak256(signatureBytes);
        const seedNode = ethers.utils.HDNode.fromSeed(entropy);
        const dbNode = seedNode.derivePath(DB_PATH);

        // Use the HDNode to create a symmetric key for this database
        this.dbSymKeys[dbName] = dbNode.privateKey;

        return this.dbSymKeys[dbName];
    }

    exportPublicKeys() {
        let keys = {
            asymmetric: this.asymKey.public,
            asymmetricBytes: this.asymKey.publicBytes,
            sign: this.signKey.public,
            signBytes: this.signKey.publicBytes
        };

        keys.asymmetricBase64 = encodeBase64(keys.asymmetricBytes);
        keys.signBase64 = encodeBase64(keys.signBytes);

        return keys;
    }

    _generateKeyPair(hdNode, method) {
        let seed = Buffer.from(hdNode.privateKey.slice(2), 'hex');

        let keyPair;
        switch (method) {
            case 'sign':
                keyPair = sign.keyPair.fromSeed(seed);
                break;
            case 'box':
                keyPair = box.keyPair.fromSecretKey(seed)
                break;
        }

        return {
            public: '0x' + Buffer.from(keyPair.publicKey).toString('hex'),
            publicBytes: keyPair.publicKey,
            private: '0x' + Buffer.from(keyPair.secretKey).toString('hex'),
            privateBytes: keyPair.secretKey,
        };
    }

    // Sign arbitrary data
    sign(data) {
        return Encryption.signData(data, this.signKey.privateBytes)
    }

    verifySig(data, sig) {
        return Encryption.verifySig(data, sig, this.signKey.publicBytes)
    }

    symEncryptBuffer(data) {
        return Encryption.symEncryptBuffer(data, this.symKey);
    }

    symDecryptBuffer(messageWithNonce) {
        return Encryption.symDecryptBuffer(messageWithNonce, this.symKey);
    }

    symEncrypt(data) {
        return Encryption.symEncrypt(data, this.symKey);
    }

    symDecrypt(messageWithNonce) {
        return Encryption.symDecrypt(messageWithNonce, this.symKey);
    }

    asymEncrypt(data, secretOrSharedKey) {
        return Encryption.asymEncrypt(data, secretOrSharedKey);
    }

    asymDecrypt(messageWithNonce, secretOrSharedKey) {
        return Encryption.asymDecrypt(messageWithNonce, secretOrSharedKey);
    }

    buildSharedKeyStart(privateKey) {
        return box.before(this.asymKey.publicBytes, privateKey);
    }

    buildSharedKeyEnd(publicKey) {
        return box.before(publicKey, this.asymKey.privateBytes);
    }

}

export default Keyring;
