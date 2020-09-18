import VidHelper from './vid';
import WebUser from './web';
import WalletHelper from '../helpers/wallet';

class RemoteUser extends Webuser {

    /**
     * Create a new user.
     * 
     * **Do not instantiate directly.**
     * 
     * @property {string} did Decentralised ID for this use (ie: `did:ethr:0xaef....`)
     * @property {string} address Blockchain address for this user (ie: `0xaef....`)
     */
    constructor(usernameOrDid, appServerUrl) {
        const did = VidHelper.getDidFromUsername(usernameOrDid);
        if (!did) {
            throw new Error("Invalid DID or Username");
        }

        const didParts = did.match(/^did\:(.*)\:(.*)/);
        if (didParts.length != 3) {
            throw new Error("Invalid DID format");
        }

        const chain = didParts[1];
        const address = didParts[2];

        super(chain, address, appServerUrl);
    }

    async _requestSignature(signMessage) {
        const walletRequest = {
            type: "signMessage",
            purpose: "authenticate",
            data: {
                message: signMessage
            }
        }

        const response = await WalletHelper.remoteRequest(this.did, walletRequest);
        return response.signature;
    }

}