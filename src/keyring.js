/*eslint no-console: "off"*/
import { secretbox, box, sign, randomBytes } from "tweetnacl";
import {
  decodeUTF8,
  encodeUTF8,
  encodeBase64,
  decodeBase64
} from "tweetnacl-util";
import { utils, ethers } from 'ethers';

const newSymNonce = () => randomBytes(secretbox.nonceLength);
const newAsymNonce = () => randomBytes(box.nonceLength);

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

        const entropy = utils.sha256('0x' + signature.slice(2));
        const mnemonic = ethers.HDNode.entropyToMnemonic(entropy);
        const seed = ethers.HDNode.mnemonicToSeed(mnemonic);

        const seedNode = ethers.HDNode.fromSeed(seed);
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
        const entropy = utils.keccak256(signatureBytes);
        const mnemonic = ethers.HDNode.entropyToMnemonic(entropy);
        const seed = ethers.HDNode.mnemonicToSeed(mnemonic);
        
        // Use the seed to create a new HDNode
        const seedNode = ethers.HDNode.fromSeed(seed);
        const dbNode = seedNode.derivePath(DB_PATH);

        // Use the HDNode to create a symmetric key for this database
        let dbSymKey = Buffer.from(dbNode.privateKey.slice(2), 'hex');
        this.dbSymKeys[dbName] = dbSymKey;

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

    // get a signature
    sign(data, key) {
        key = key ? key : this.signKey;
        let messageUint8 = decodeUTF8(JSON.stringify(data));
        return encodeBase64(sign.detached(messageUint8, key.privateBytes));
    }

    verifySig(data, sig) {
        let messageUint8 = decodeUTF8(JSON.stringify(data));
        return sign.detached.verify(messageUint8, decodeBase64(sig), this.signKey.publicBytes);
    }

    symEncryptBuffer(data) {
        const keyUint8Array = this.symKey;

        const nonce = newSymNonce();
        const messageUint8 = data;
        const box = secretbox(messageUint8, nonce, keyUint8Array);

        const fullMessage = new Uint8Array(nonce.length + box.length);
        fullMessage.set(nonce);
        fullMessage.set(box, nonce.length);

        const base64FullMessage = encodeBase64(fullMessage);
        return base64FullMessage;
    }

    symDecryptBuffer(messageWithNonce) {
        const keyUint8Array = this.symKey;
        const messageWithNonceAsUint8Array = decodeBase64(messageWithNonce);
        const nonce = messageWithNonceAsUint8Array.slice(0, secretbox.nonceLength);
        const message = messageWithNonceAsUint8Array.slice(
            secretbox.nonceLength,
            messageWithNonce.length
        );

        const decrypted = secretbox.open(message, nonce, keyUint8Array);
        if (!decrypted) {
            throw new Error("Could not decrypt message");
        }

        return decrypted;
    }

    symEncrypt(data) {
        const keyUint8Array = this.symKey;

        const nonce = newSymNonce();
        const messageUint8 = decodeUTF8(JSON.stringify(data));
        const box = secretbox(messageUint8, nonce, keyUint8Array);

        const fullMessage = new Uint8Array(nonce.length + box.length);
        fullMessage.set(nonce);
        fullMessage.set(box, nonce.length);

        const base64FullMessage = encodeBase64(fullMessage);
        return base64FullMessage;
    }

    symDecrypt(messageWithNonce) {
        const keyUint8Array = this.symKey;
        const messageWithNonceAsUint8Array = decodeBase64(messageWithNonce);
        const nonce = messageWithNonceAsUint8Array.slice(0, secretbox.nonceLength);
        const message = messageWithNonceAsUint8Array.slice(
            secretbox.nonceLength,
            messageWithNonce.length
        );

        const decrypted = secretbox.open(message, nonce, keyUint8Array);
        if (!decrypted) {
            throw new Error("Could not decrypt message");
        }

        const base64DecryptedMessage = encodeUTF8(decrypted);
        return JSON.parse(base64DecryptedMessage);
    }

    asymEncrypt(data, secretOrSharedKey) {
        const nonce = newAsymNonce();
        const messageUint8 = decodeUTF8(JSON.stringify(data));
        const encrypted = box.after(messageUint8, nonce, secretOrSharedKey);

        const fullMessage = new Uint8Array(nonce.length + encrypted.length);
        fullMessage.set(nonce);
        fullMessage.set(encrypted, nonce.length);

        const base64FullMessage = encodeBase64(fullMessage);
        return base64FullMessage;
    }

    asymDecrypt(messageWithNonce, secretOrSharedKey) {
        const messageWithNonceAsUint8Array = decodeBase64(messageWithNonce);
        const nonce = messageWithNonceAsUint8Array.slice(0, box.nonceLength);
        const message = messageWithNonceAsUint8Array.slice(
            box.nonceLength,
            messageWithNonce.length
        );

        const decrypted = box.open.after(message, nonce, secretOrSharedKey);

        if (!decrypted) {
            throw new Error('Could not decrypt message');
        }

        const base64DecryptedMessage = encodeUTF8(decrypted);
        return JSON.parse(base64DecryptedMessage);
    }

    buildSharedKeyStart(privateKey) {
        return box.before(this.asymKey.publicBytes, privateKey);
    }

    buildSharedKeyEnd(publicKey) {
        return box.before(publicKey, this.asymKey.privateBytes);
    }

}

export default Keyring;
