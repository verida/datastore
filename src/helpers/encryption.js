import { secretbox, box, randomBytes } from "tweetnacl";
import {
  decodeUTF8,
  encodeUTF8,
  encodeBase64,
  decodeBase64
} from "tweetnacl-util";

const newSymNonce = () => randomBytes(secretbox.nonceLength);
const newAsymNonce = () => randomBytes(box.nonceLength);
const newKey = (length) => randomBytes(length ? length : secretbox.keyLength);

class Encryption {

    static symEncryptBuffer(data, keyUint8Array) {
        const nonce = newSymNonce();
        const messageUint8 = data;
        const box = secretbox(messageUint8, nonce, keyUint8Array);

        const fullMessage = new Uint8Array(nonce.length + box.length);
        fullMessage.set(nonce);
        fullMessage.set(box, nonce.length);

        const base64FullMessage = encodeBase64(fullMessage);
        return base64FullMessage;
    }

    static symDecryptBuffer(messageWithNonce, keyUint8Array) {
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

    static symEncrypt(data, keyUint8Array) {
        data = decodeUTF8(JSON.stringify(data));
        return Encryption.symEncryptBuffer(data, keyUint8Array);
    }

    static symDecrypt(messageWithNonce, keyUint8Array) {
        let decrypted = Encryption.symDecryptBuffer(messageWithNonce, keyUint8Array);
        const base64DecryptedMessage = encodeUTF8(decrypted);
        return JSON.parse(base64DecryptedMessage);
    }

    static asymEncrypt(data, secretOrSharedKey) {
        const nonce = newAsymNonce();
        const messageUint8 = decodeUTF8(JSON.stringify(data));
        const encrypted = box.after(messageUint8, nonce, secretOrSharedKey);

        const fullMessage = new Uint8Array(nonce.length + encrypted.length);
        fullMessage.set(nonce);
        fullMessage.set(encrypted, nonce.length);

        const base64FullMessage = encodeBase64(fullMessage);
        return base64FullMessage;
    }

    static asymDecrypt(messageWithNonce, secretOrSharedKey) {
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

    static randomKey(length) {
        return newKey(length);
    }

}

export default Encryption