import Encryption from "@verida/encryption-utils";
import VidHelper from './vid';
import DIDHelper from '@verida/did-helper';
import Verida from '../app';

const REQUEST_SCHEMA = 'https://schemas.verida.io/wallet/request/schema.json';

/**
 * Very basic web3 wallet helper. Needs deprecating.
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
    async remoteRequest(did, requestData, cb) {
        // Generate a random key pair for this communication
        const keyPair = Encryption.randomKeyPair();

        // send the user a login request message to their "wallet_request" database
        const remoteDatastore = await Verida.openExternalDatastore(REQUEST_SCHEMA, did, {
            permissions: {
                read: 'public',
                write: 'public'
            },
            signData: false
        });

        // Asym encrypt with the recipients public key
        const vidDoc = await VidHelper.getByDid(did, Verida.config.vaultAppName);
        const publicAsymKey = DIDHelper.getKeyBytes(vidDoc, 'asym');
        const sharedKey = Encryption.sharedKey(publicAsymKey, keyPair.secretKey);
        const encrypted = Encryption.asymEncrypt(requestData, sharedKey);
        
        // Send request to the recipient's Vault and include the public key for encrypting the response
        const request = {
            request: encrypted,
            publicKey: Encryption.encodeBase64(keyPair.publicKey)
        }

        const response = await remoteDatastore.save(request);
        if (!response) {
            console.error(remoteDatastore.errors);
            throw new Error('Unable to save remote request');
        }

        const requestId = response.id;

        // Watch the wallet request datastore for any updates to the originally
        // created request. If it changes, decrypt the data using previously
        // supplied encryption keyraise an event with this.emit("response", data);
        const datastoreDb = await remoteDatastore.getDb();
        const db = await datastoreDb.getInstance();
        db.changes({
            since: 'now',
            include_docs: true,
            live: true,
            doc_ids: [response.id]
        }).on('change', function(data) {
            const doc = data.doc

            // Check this change relates to this request we're watching AND
            // has a valid response
            if (doc._id == requestId && doc.response) {
                if (doc.response) {
                    // Decrypt the response
                    const response = Encryption.asymDecrypt(doc.response, sharedKey)
                    
                    // Trigger the registered callback with the response data
                    cb(requestId, response)

                    // @todo: Delete the request?
                    return;
                }
            } else {
                console.log("not found")
            }

            
        }).on('error', function(err) {
            console.log("Error watching for wallet request database changes");
            console.log(err);
        })

        return requestId
    }

}

let walletHelper = new WalletHelper();
export default walletHelper;