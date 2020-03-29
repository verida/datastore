import { ecsign, hashPersonalMessage, toRpcSig } from 'ethereumjs-util';
import Base from './base';

class ServerUser extends Base {

    /**
     * Create a new user.
     * 
     * **Do not instantiate directly.**
     * 
     * @property {string} did Decentralised ID for this use (ie: `did:ethr:0xaef....`)
     * @property {string} address Blockchain address for this user (ie: `0xaef....`)
     */
    constructor(chain, address, appServerUrl, privateKey) {
        super(chain, address, appServerUrl);
        
        if (!privateKey) {
            throw new Error("No private key specified for server user");
        }

        this.privateKey = Buffer.from(privateKey, "hex");
    }

    async requestSignature(appName, accessType) {
        let signMessage = this._getSignMessage(appName, accessType);
        let message = Buffer.from(signMessage);
        let messageHash = hashPersonalMessage(message);
        let sig = ecsign(messageHash, this.privateKey);
        return toRpcSig(sig.v, sig.r, sig.s);
    }

}

export default ServerUser;