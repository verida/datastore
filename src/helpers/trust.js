import _ from 'lodash';
import didJWT from 'did-jwt';
import Verida from '../app';

class Trust {

    /**
     * Decode a DID-JWT
     * 
     * @param {string} didJwt 
     */
    static decodeDidJwt(didJwt) {
        return didJWT.decodeJWT(didJwt);
    }

    /**
     * Get a list of the profiles that signed a piece of data
     * 
     * @param {object} data 
     */
    static async getSigners(data) {
        if (!data.signatures) {
            return [];
        }

        let signers = [];
        for (let did in data.signatures) {
            let profile = await Verida.openProfile(did);
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
    static verifySignature(data, did, signature) {
        return true;
    }

}

export default Trust;