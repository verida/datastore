import _ from 'lodash';
import didJWT from 'did-jwt';
import Verida from '../app';

/**
 * Helper class to help with signatures and JWT's
 */
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
     * @return {array} Array of DID's that signed the given data
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
     * Verify a signature
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