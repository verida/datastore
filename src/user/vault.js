
import Base from './base';
import { ethers } from 'ethers';

const STORAGE_KEY = 'VERIDA_SESSION_';

class VaultUser extends Base {

    /**
     * Create a new user.
     * 
     * **Do not instantiate directly.**
     * 
     * @property {string} did Decentralised ID for this use (ie: `did:ethr:0xaef....`)
     * @property {string} address Blockchain address for this user (ie: `0xaef....`)
     */
    constructor(chain, address, appServerUrl, signature, appName) {
        super(chain, address, appServerUrl);

        let context = appName;
        let accessType = 'default';
        let hex = Buffer.from(JSON.stringify([context, accessType])).toString("hex");
        let hash = ethers.utils.sha256('0x' + hex);
        this.signatures[hash] = signature;
    }

    async _requestSignature(signMessage) {
        // @todo: generate a vault inbox message to this user's DID
        // asking them to sign the message
        throw new Error("_requestSignature not implemented")
    }

    // @todo: implement sessions?

}

export default VaultUser;