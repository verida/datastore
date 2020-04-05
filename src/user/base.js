import VidHelper from '../helpers/vid';
import Keyring from "../keyring";
import App from '../app';
const _ = require('lodash');
import didJWT from 'did-jwt';

class Base {

    /**
     * 
     * @param {*} chain 
     * @param {*} address 
     * @param {*} serverUrl URL of the application server for this user and application combination. This is used to populate the serviceUrl for third party apps to connect.
     */
    constructor(chain, address, serverUrl) {
        this.chain = chain;
        this.address = address;
        this.serverUrl = serverUrl;
        this.did = VidHelper.getDidFromAddress(address, chain);

        this.appConfigs = {};
    }

    async getAppVid(appName, keyring) {
        if (this.appConfigs[appName]) {
            return this.appConfigs[appName].vid;
        }

        let vidDoc = await VidHelper.getByDid(this.did, appName);

        // User doesn't exist, so try to create
        if (!vidDoc) {
            vidDoc = await VidHelper.save(this.did, appName, keyring, this.serverUrl);
        }

        return vidDoc.id;
    }

    async getAppConfig(appName, force, signature) {
        appName = appName || App.config.appName;
        // Load from in memory cache
        if (this.appConfigs[appName]) {
            return this.appConfigs[appName];
        }

        // Load from localStorage
        if (this.restoreFromSession(appName)) {
            return this.appConfigs[appName];
        }

        if (!force) {
            return false;
        }

        if (!signature) {
            signature = await this.requestSignature(appName, "default");
        }

        if (!signature) {
            throw new Error("Unable to obtain signature from user");
        }

        let keyring = new Keyring(signature);
        let vid = await this.getAppVid(appName, keyring, this.serverUrl);

        this.appConfigs[appName] = {
            keyring: keyring,
            vid: vid
        };

        this.saveToSession(appName);
        return this.appConfigs[appName];
    }

    saveToSession(appName) {
        return false;
    }

    restoreFromSession(appName) {
        return false;
    }
    

    /**
     * Sign data as the current user
     * 
     * @param {*} data 
     * @todo Think about signing data and versions / insertedAt etc.
     */
    async signData(data, appName) {
        if (!data.signatures) {
            data.signatures = {};
        }

        appName = appName || App.config.appName;

        let _data = _.merge({}, data);
        delete _data['_signatures'];

        let appConfig = await this.getAppConfig(appName, true);
        if (!appConfig) {
            throw new Error("User not authorized to sign for \""+appName+"\"");
        }

        data.signatures[appConfig.vid] = appConfig.keyring.sign(_data);
    }

    /**
     * Create a DID-JWT from a data object
     * @param {*} data 
     */
    async createDidJwt(data, config) {
        config = _.merge({
            expiry: null,
            appName: App.config.appName,
            insertedAt: (new Date()).toISOString()
        }, config);

        let userConfig = await this.getAppConfig(config.appName, true);
        let keyring = userConfig.keyring;
        let signer = didJWT.SimpleSigner(keyring.signKey.private);

        let jwt = await didJWT.createJWT({
            aud: this.did,
            vid: userConfig.vid,
            exp: config.expiry,
            data: data,
            veridaApp: config.appName,
            insertedAt: config.insertedAt
        }, {
            alg: 'ES256K-R',
            issuer: this.did,
            signer
        });

        return jwt;
    }

    logout(appName) {
        delete this.appConfigs[appName];
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

export default Base;