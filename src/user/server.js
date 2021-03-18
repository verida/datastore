import utils from '@verida/wallet-utils';
import Base from './base';
const bs58 = require('bs58');

class ServerUser extends Base {
  /**
   * Create a new user.
   *
   * **Do not instantiate directly.**
   *
   * @property {string} did Decentralised ID for this use (ie: `did:ethr:0xaef....`)
   * @property {string} address Blockchain address for this user (ie: `0xaef....`)
   * @property {string} appServerUrl URL of the Verida app server 
   * @property {string} privateKey Private key (with leading `0x` for ethereum and leading `ed25519:` for near)
   */
  constructor(chain, address, appServerUrl, privateKey) {
    super(chain, address, appServerUrl);

    if (!privateKey) {
      throw new Error("No private key specified for server user");
    }

    this.privateKeyHex = privateKey;

    // todo: refactor for better multi chain support
    switch (chain) {
      case 'ethr':
        this.privateKey = Buffer.from(privateKey.slice(2), 'hex');
        break;
      case 'near':
        this.privateKey = bs58.decode(privateKey.replace('ed25519:',''));
        break;
      default:
        throw new Error('Invalid chain specified')
    }

  }

  async _requestSignature(signMessage) {
    return utils.signMessage(this.chain, this.privateKeyHex, signMessage);
  }

}

export default ServerUser;