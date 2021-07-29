const nearAPI = require('near-api-js');
const _ = require('lodash');

class NearHelper {

    constructor(config) {
        if (this.wallet) {
            return;
        }

        // Only inject nearAPI into window if window exists (indicating we are
        // in a web context). Only inject in the constructor which indicates
        // NEAR needs initializing
        if (typeof(window) != 'undefined' && !window.nearAPI)
            window.nearAPI = nearAPI;

        config = _.merge({
            networkId: 'default',
            nodeUrl: 'https://rpc.testnet.near.org',
            walletUrl: 'https://wallet.testnet.near.org',
            helperUrl: 'https://helper.testnet.near.org',
        }, config);
        this.config = config;

        if (!this.config.contractName) {
            throw new Error('NEAR contract name must be specified')
        }
        
        const {
            Near
        } = nearAPI;
        const { networkId, nodeUrl, walletUrl } = this.config;
        this.near = new Near({
            networkId, nodeUrl, walletUrl, deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() }
        });
        this.wallet = new nearAPI.WalletAccount(this.near);

        if (this.wallet.isSignedIn()) {
            this.account = this.wallet.account();
        }
    }

    requestSignIn() {
        this.wallet.requestSignIn(this.config.contractName);
    }

    isSignedIn() {
        if (!this.wallet) {
            return false;
        }

        return this.wallet.isSignedIn();
    }

}

export default NearHelper;