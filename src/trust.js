import _ from 'lodash';
import didJWT from 'did-jwt';

class Trust {

    constructor(app) {
        this._app = app;
    }

    /**
     * 
     * @param {*} didJwt 
     */
    decodeDidJwt(didJwt) {
        return didJWT.decodeJWT(didJwt);
    }

    /**
     * Get a list of the profiles that signed a piece of data
     * 
     * @param {*} data 
     * @todo
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
     * @param {*} data 
     * @param {*} did 
     * @param {*} signature 
     * @todo
     */
    verifySignature(data, did, signature) {
        return true;
    }

}

export default Trust;