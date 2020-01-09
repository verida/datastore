/*eslint no-console: "off"*/
"use strict"

const pbkdf2 = require('native-crypto/pbkdf2');
const Web3 = require('web3');

class User {

    constructor(app) {
        this._app = app;
        this._web3 = null;

        // User's global DID and address
        this.did = null;
        this.address = null;

        // Application username and password
        this.username = null;
        this.password = null;

        // Application DSN
        this.dsn = null;
        this.salt = null;

        // User's wallet DSN
        this.walletDsn = this._app.config.walletDsn ? this._app.config.walletDsn : 'http://localhost:5984/';
    }

    async connect() {
        let web3Provider = null;
        if (window.ethereum) {
            // Modern dapp browsers...
            web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                throw Error("User denied account access");
            }
        }
        else if (window.web3) {
            // Legacy dapp browsers...
            web3Provider = window.web3.currentProvider;
        }
        else {
            // If no injected web3 instance is detected throw an exception
            throw Error("Unable to locate Ethereum");
        }

        this._web3 = window._web3 = new Web3(web3Provider);
        this.address = await window.ethereum.enable();
        this.address = this.address.toString();
        this.did = 'did:ethr:'+this.address;

        let signMessage = "\""+this._app.name+"\" (" + window.location.hostname +") is requesting access to " + this.did;
        this.password = await this._web3.eth.personal.sign(signMessage, this.address);


        // Fetch user details from server
        let response;
        try {
            this._app.setCredentials(this.did, this.password);
            response = await this._app.client.getUser(this.did);
        } catch (err) {
            if (err.response && err.response.data.data && err.response.data.data.did == "Invalid DID specified") {
                // User doesn't exist, so create
                response = await this._app.client.createUser(this.did);
            }
            else {
                // Unknown error
                throw err;
            }
        }

        // Populate the rest of this user object
        this.username = response.data.user.username;    // not required as it's not used
        this.dsn = response.data.user.dsn;
        this.salt = response.data.user.salt;
        this.key = await pbkdf2(this.password, new Buffer(this.salt, 'hex'), 100000, 256 / 8, "sha512");
    }
}

export default User;