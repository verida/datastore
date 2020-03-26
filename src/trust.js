import _ from 'lodash';
import didJWT from 'did-jwt';

class Trust {

    constructor(app) {
        this._app = app;
    }

    /**
     * Create a DID-JWT from a data object
     * @param {*} data 
     */
    async createDidJwt(data, config) {
        config = _.merge({
            expiry: null,
            appName: this._app.name,
            insertedAt: (new Date()).toISOString()
        }, config);

        let keyring = await this._app.dataserver.getKeyring();
        let signer = didJWT.SimpleSigner(keyring.signKey.private);
        let userVid = await this._app.user.getAppVid(config.appName);

        let jwt = await didJWT.createJWT({
            aud: this._app.user.did,
            vid: userVid.id,
            exp: config.expiry,
            data: data,
            veridaApp: config.appName,
            insertedAt: config.insertedAt
        }, {
            alg: 'ES256K-R',
            issuer: this._app.user.did,
            signer
        });

        return jwt;
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