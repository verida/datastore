const Web3 = require('web3');
import Base from './base';

class WebUser extends Base {

    /**
     * Create a new user.
     * 
     * **Do not instantiate directly.**
     * 
     * @property {string} did Decentralised ID for this use (ie: `did:ethr:0xaef....`)
     * @property {string} address Blockchain address for this user (ie: `0xaef....`)
     */
    constructor(chain, address, appServerUrl, web3Provider) {
        super(chain, address, appServerUrl);

        if (!web3Provider) {
            throw new Error("No web3 provider specified for server user");
        }

        this.web3Provider = new Web3(web3Provider);
    }

    async requestSignature(appName, accessType) {
        let signMessage = this._getSignMessage(appName, accessType);
        return await this.web3Provider.eth.personal.sign(signMessage, this.address);
    }

}

export default WebUser;