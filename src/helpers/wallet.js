import Encryption from "./helpers/encryption";
import VidHelper from './vid';
import DIDHelper from '@verida/did-helper';
import Verida from '../app';

//const EventEmitter = require('events');

/**
 * 
 */
class WalletHelper {

    /**
     * Helper to connect a wallet.
     */
    async connectWeb3(chain) {
        let web3Provider;
        if (chain == 'ethr') {
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

            return web3Provider;
        }
    }

    /**
     * Helper to get the current address for a wallet.
     * 
     * @param {*} chain 
     */
    /*eslint no-console: "off"*/
    async getAddress(chain) {
        let address;

        switch (chain) {
            case 'ethr':
                address = await window.ethereum.enable();
                return address.toString();
        }
    }

    /**
     * 
     * @param {string} appName Name of application to login to
     * @param {string} usernameOrDid Valid DID or a Verida username
     */
    static async remoteRequest(did, requestData) {
        // add an encryption key for the mobile app to encrypt the response with
        requestData.responseKey = Encryption.randomKey();

        // send the user a login request message to their "wallet_request" database
        const remoteDatastore = Verida.openExternalDatastore("https://schemas.verida.io/wallet/request/schema.json", {
            permissions: {
                read: 'owner',
                write: 'public'
            }
        });

        // encrypt with the recipients public key
        const vidDoc = await VidHelper.getByDid(did, Verida.config.vaultAppName);
        const publicAsymKey = DIDHelper.getKeyBytes(vidDoc, 'asym');
        const encrypted = Encryption.symEncrypt(requestData, publicAsymKey);
        
        // send request
        const request = {
            content: encrypted
        };
        const response = await remoteDatastore.save(request);
        const requestId = response.id;

        // Watch the wallet request datastore for any updates to the originally
        // created request. If it changes, decrypt the data using previously
        // supplied encryption keyraise an event with this.emit("response", data);
        const datastoreDb = await remoteDatastore.getDb();
        const db = await datastoreDb.getInstance();
        db.changes({
            since: 'now',
            live: true
        }).on('change', function(data) {
            console.log("received wallet request data change");
            console.log(data);
            if (data._id == requestId) {
                if (data.deleted) {
                    // ignore deleted changes
                    return;
                }
            }
        }).on('error', function(err) {
            console.log("Error watching for wallet request changes");
            console.log(err);
        })

        // mobile app is watching "wallet_request" database and identifies a new request
        // decrypts request
        // adds request to "wallet_request_history"
        // responds with response or denies request
        // if accept, then sign consent for requested application
        // encrypt response message using supplied encryption key
    }

}

let walletHelper = new WalletHelper();
export default walletHelper;