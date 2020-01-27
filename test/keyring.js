var assert = require("assert");
import { box } from "tweetnacl";

import Keyring from "../src/keyring";
import { decodeUTF8 } from "tweetnacl-util";

describe("Keyring", function() {
    var keyring;

    describe("Signing", function() {
        this.beforeAll(function() {
            let seed = new Uint8Array([37, 111, 93, 122, 134, 74, 12, 201, 10, 204, 68, 90, 213, 69, 150, 82, 163, 69, 157, 239, 64, 194, 140, 31, 144, 79, 225, 141, 74, 52, 70, 90]);
            seed = Buffer.from(seed).toString('hex');
            keyring = new Keyring(seed);
        });

        it("should generate a verified signature", function() {
            let data = {
                "hello": "world"
            };

            let sig = keyring.sign(data);
            let verified = keyring.verifySig(data, sig);
            
            assert(verified,true);
        });
    });

    describe("Symmetric encryption", function() {
        it("should symmetrically encrypt and decrypt", function() {
            let data = {
                "hello": "world"
            };

            let encryptedMessage = keyring.symEncrypt(data);
            let decryptedMessage = keyring.symDecrypt(encryptedMessage);

            assert.deepEqual(data, decryptedMessage);
        });
    });

    describe("Asymmetric encryption", function() {
        it("should assymetrically encrypt and decrypt an inbox message", function() {
            let data = {
                "hello": "world"
            };
    
            // create a test key pair representing the user submitting to an inbox
            let otherKeyPair = box.keyPair();
            
            // encrypt the data
            let sharedKeyStart = keyring.buildSharedKeyStart(otherKeyPair.secretKey);
            let encrypted = keyring.asymEncrypt(data, sharedKeyStart);

            // decrypt the data
            let sharedKeyEnd = keyring.buildSharedKeyEnd(otherKeyPair.publicKey);
            let decrypted = keyring.asymDecrypt(encrypted, sharedKeyEnd);
    
            assert.deepEqual(data, decrypted);
        });
    });
});