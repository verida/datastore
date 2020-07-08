import { ecsign, hashPersonalMessage, toRpcSig } from 'ethereumjs-util';
import { cry } from 'thor-devkit';

import Base from './base';

class ServerUser extends Base {

    /**
     * Create a new user.
     *
     * **Do not instantiate directly.**
     *
     * @property {string} did Decentralised ID for this use (ie: `did:ethr:0xaef....`)
     * @property {string} address Blockchain address for this user (ie: `0xaef....`)
     * @property {string} appServerUrl URL of the Verida app server 
     * @property {string} privateKey Private key (with leading `0x`)
     */
    constructor(chain, address, appServerUrl, privateKey) {
        super(chain, address, appServerUrl);

        if (!privateKey) {
            throw new Error("No private key specified for server user");
        }

        this.privateKeyHex = privateKey;
        this.privateKey = Buffer.from(privateKey.slice(2), 'hex');
    }

    async _requestSignature(signMessage) {
        const message = Buffer.from(signMessage);

        if (this.chain == 'ethr') {
            const messageHash = hashPersonalMessage(message);
            const sig = ecsign(messageHash, this.privateKey);
            return toRpcSig(sig.v, sig.r, sig.s);
        }

        if (this.chain == 'vechain') {
            const sig = cry.secp256k1.sign(cry.keccak256(signMessage), this.privateKey)
            return sig.toString('hex')
        }
    }

}

export default ServerUser;
