import DIDHelper from '@verida/did-helper';
import { ecsign, hashPersonalMessage, toRpcSig } from 'ethereumjs-util';

class ServerUser {

    /**
     * Create a new user.
     * 
     * **Do not instantiate directly.**
     * 
     * @property {string} did Decentralised ID for this use (ie: `did:ethr:0xaef....`)
     * @property {string} address Blockchain address for this user (ie: `0xaef....`)
     */
    constructor(chain, address, privateKey, didServerUrl) {
        if (!privateKey) {
            throw new Error("No private key specified for server user");
        }

        this.chain = chain;
        this.address = address;
        this.privateKey = Buffer.from(privateKey, "hex");
        this.did = 'did:'+this.chain+':'+this.address.toLowerCase();
        this.didServerUrl = didServerUrl;

        this._vids = {};
    }

    async getAppVid(appName) {
        if (!this._vids[appName]) {
            this._vids[appName] = await DIDHelper.loadForApp(this.did, appName, this.didServerUrl);
        }
        
        return this._vids[appName];
    }

    async requestSignature(appName, accessType) {
        let signMessage = this._getSignMessage(appName, accessType);

        console.log("sign message: ",signMessage);

        let message = Buffer.from(signMessage);
        let messageHash = hashPersonalMessage(message);

        let sig = ecsign(messageHash, this.privateKey);
        return toRpcSig(sig.v, sig.r, sig.s);
    }

    _getSignMessage(appName, accessType) {
        switch (accessType) {
            case 'profile':
                return "Do you approve this application to update your Verida public profile?\n\n" + this.did;
            default:
                return "Do you approve access to view and update \""+appName+"\"?\n\n" + this.did;
        }
    }

}

export default ServerUser;