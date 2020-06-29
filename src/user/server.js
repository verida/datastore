import { ecsign, hashPersonalMessage, toRpcSig } from 'ethereumjs-util';
import { Framework } from '@vechain/connex-framework'
import { Driver, SimpleNet, SimpleWallet, options } from '@vechain/connex.driver-nodejs'

import Base from './base';

class ServerUser extends Base {

    /**
     * Create a new user.
     *
     * **Do not instantiate directly.**
     *
     * @property {string} did Decentralised ID for this use (ie: `did:ethr:0xaef....`)
     * @property {string} address Blockchain address for this user (ie: `0xaef....`)
     */
    constructor(chain, address, appServerUrl, privateKey) {
        super(chain, address, appServerUrl);

        if (!privateKey) {
            throw new Error("No private key specified for server user");
        }

        this.privateKeyHex = privateKey;
        this.privateKey = Buffer.from(privateKey.slice(2), 'hex');
    }

    async _requestSignature(signMessage) {
        const message = Buffer.from(signMessage);

        if (this.chain == 'ethr') {
            const messageHash = hashPersonalMessage(message);
            const sig = ecsign(messageHash, this.privateKey);
            return toRpcSig(sig.v, sig.r, sig.s);
        }

        if (this.chain == 'vechain') {
            const wallet = new SimpleWallet();
            wallet.import(this.privateKeyHex);
            const driver = await Driver.connect(new SimpleNet('http://localhost:8669/'), wallet);
            const connex = new Framework(driver);
            const signingService = connex.vendor.sign('cert');
            const signature = await signingService.request({
                purpose: 'agreement',
                payload: {
                    type: 'text',
                    content: message
                }
            });

            return signature;
        }
    }

}

export default ServerUser;
