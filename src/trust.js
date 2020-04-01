import _ from 'lodash';
import didJWT from 'did-jwt';

class Trust {

    constructor(app) {
        this._app = app;
    }

    /**
     * Decode a DID-JWT
     * 
     * @param {string} didJwt 
     */
    decodeDidJwt(didJwt) {
        return didJWT.decodeJWT(didJwt);
    }

    /**
     * Get a list of the profiles that signed a piece of data
     * 
     * @param {object} data 
     */
    async getSigners(data) {
        if (!data.signatures) {
            return [];
        }

        let signers = [];
        for (let did in data.signatures) {
            let profile = await this.app.openProfile(did);
            signers[did] = profile;
        }

        return signers;
    }

    /**
     * 
     * @param {object} data 
     * @param {string} did 
     * @param {string} signature 
     * @todo Implement
     */
    verifySignature(data, did, signature) {
        return true;
    }

}

export default Trust;