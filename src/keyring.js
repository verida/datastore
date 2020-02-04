/*eslint no-console: "off"*/
import { secretbox, box, sign, randomBytes } from "tweetnacl";
import {
  decodeUTF8,
  encodeUTF8,
  encodeBase64,
  decodeBase64
} from "tweetnacl-util";
import { ethers } from 'ethers';

const newSymNonce = () => randomBytes(secretbox.nonceLength);
const newAsymNonce = () => randomBytes(box.nonceLength);

const BASE_PATH = "m/6696500'/0'/0'"
//const ETH_PATH = "m/44'/60'/0'/0"

/**
 * Container for user's encryption keys for an application.
 */
class Keyring {

    /**
     * Create a new Keyring for an application.
     * 
     * @ignore
     * @param {string} seed Hex string of the seed generated from a message signed by the users's on chain account
     */
    constructor(seed) {
        const seedNode = ethers.HDNode.fromSeed(seed);
        const baseNode = seedNode.derivePath(BASE_PATH);

        // Build symmetric key
        let symKey = baseNode.derivePath("0");
        this.symKey = Buffer.from(symKey.privateKey.slice(2), 'hex');

        // Build asymmetric keys
        let asymKey = baseNode.derivePath("1");
        this.asymKey = this._generateKeyPair(asymKey, "box");

        // Build signing keys
        let signKey = baseNode.derivePath("2");
        this.signKey = this._generateKeyPair(signKey, "sign");

        //this.ethKey = seedNode.derivePath(ETH_PATH);
    }

    exportPublicKeys() {
        return {
            asymmetric: this.asymKey.public,
            asymmetricBytes: decodeUTF8(this.asymKey.public),
            sign: this.signKey.public,
            signBytes: decodeUTF8(this.signKey.public)
        }
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
    sign(data) {
        let messageUint8 = decodeUTF8(JSON.stringify(data));
        return encodeBase64(sign.detached(messageUint8, this.signKey.privateBytes));
    }

    verifySig(data, sig) {
        let messageUint8 = decodeUTF8(JSON.stringify(data));
        return sign.detached.verify(messageUint8, decodeBase64(sig), this.signKey.publicBytes);
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