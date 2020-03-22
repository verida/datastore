import DIDHelper from '@verida/did-helper';
const Web3 = require('web3');

class WebUser {

    /**
     * Create a new user.
     * 
     * **Do not instantiate directly.**
     * 
     * @property {string} did Decentralised ID for this use (ie: `did:ethr:0xaef....`)
     * @property {string} address Blockchain address for this user (ie: `0xaef....`)
     */
    constructor(chain, address, web3Provider) {
        if (!web3Provider) {
            throw new Error("No web3 provider specified for server user");
        }

        this.web3Provider = new Web3(web3Provider);
        this.chain = chain;
        this.address = address;
        this.did = 'did:'+this.chain+':'+this.address.toLowerCase();

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
        return await this.web3Provider.eth.personal.sign(signMessage, this.address);
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

export default WebUser;