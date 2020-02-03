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

}

let walletHelper = new WalletHelper();
export default walletHelper;