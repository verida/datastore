/*eslint no-console: "off"*/
"use strict"

const Web3 = require('web3');

class User {

    /**
     * Create a new user.
     * 
     * **Do not instantiate directly.**
     * 
     * @property {string} did Decentralised ID for this use (ie: `did:ethr:0xaef....`)
     * @property {string} address Blockchain address for this user (ie: `0xaef....`)
     */
    constructor(chain, address, web3Provider) {
        this.web3Provider = new Web3(web3Provider);
        this.chain = chain;
        this.address = address;
        this.did = 'did:'+this.chain+':'+this.address;
    }

}

export default User;