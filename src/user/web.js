import App from '../app';
import Base from './base';
import store from 'store';
import Keyring from "../keyring";

const STORAGE_KEY = 'VERIDA_SESSION_';

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
            throw new Error("No web3 provider specified for web user");
        }

        this.web3Provider = web3Provider;
    }

    async _requestSignature(signMessage) {
        return this.web3Provider.sign(signMessage, this.address);
    }

    saveToSession(appName) {
        if (!this.appConfigs[appName]) {
            return false;
        }

        let _storageKey = WebUser.getSessionKey(this.did, appName);
        let data = {
            signature: this.appConfigs[appName].keyring.signature,
            vid: this.appConfigs[appName].vid
        }

        store.set(_storageKey, data);
        return true;
    }

    restoreFromSession(appName) {
        let _storageKey = WebUser.getSessionKey(this.did, appName);
        let data = store.get(_storageKey);
        if (data) {
            this.appConfigs[appName] = {
                keyring: new Keyring(data.signature),
                vid: data.vid
            }
            return true;
        }

        return false;
    }

    static getSessionKey(did, appName) {
        appName = appName || App.config.appName;
        return STORAGE_KEY + appName + did;
    }

    static hasSessionKey(did, appName) {
        let _storageKey = WebUser.getSessionKey(did, appName);
        let data = store.get(_storageKey);

        if (data) {
            return true;
        }

        return false;
    }

    logout(appName) {
        super.logout(appName);
        let _storageKey = WebUser.getSessionKey(this.did, appName);
        store.remove(_storageKey);
    }

}

export default WebUser;