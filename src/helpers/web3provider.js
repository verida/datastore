
class Web3ProviderHelper {

    constructor(type, instance, config) {
        this.type = type;
        this.instance = instance;
        this.config = config;
    }

    /**
     * 
     * @param {*} message 
     * @param {*} address 
     * @return string Hexadecimal signature with leading `0x`
     */
    async sign (message, address) {
        switch (this.type) {
            case 'ethr':
                return this.instance.eth.personal.sign(message, address);
            case 'near':
                if (!this.instance.isSignedIn()) {
                    // this will do a browser redirect
                    await this.instance.requestSignIn();
                }
                const messageBuffer = Buffer.from(message);
                const account = this.instance.account;
                const signature = await account.connection.signer.signMessage(messageBuffer, account.accountId, this.instance.config.networkId);
                return '0x' + Buffer.from(signature.signature).toString('hex');
        }
    }

    async getAddress() {
        switch (this.type) {
            case 'ethr':
                let address = await window.ethereum.enable();
                return address.toString();
            case 'near':
                if (this.instance && this.instance.account) {
                    return this.instance.account.accountId;
                }
        }
    }



}

export default Web3ProviderHelper;