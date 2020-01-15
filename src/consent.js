/*eslint no-console: "off"*/

class Consent {

    async requestSignature(user, accessType, appName) {
        let web3 = user.web3Provider;
        let signMessage = this._getSignMessage(user.did, accessType, appName);
        return await web3.eth.personal.sign(signMessage, user.address);
    }

    _getSignMessage(did, accessType, appName) {
        console.log(did, accessType);
        switch (accessType) {
            case 'profile':
                return "Do you approve this application to update your Verida public profile?\n\n" + did;
            default:
                return "Do you approve access to view and update \""+appName+"\"?\n\n" + did;
        }
    }

}

let consent = new Consent();
export default consent;