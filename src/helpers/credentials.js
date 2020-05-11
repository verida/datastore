import didJWT from 'did-jwt';
import { createVerifiableCredential, createPresentation, verifyPresentation, verifyCredential } from 'did-jwt-vc';
import { Resolver } from 'did-resolver';
import { getResolver } from './vid';
import { encodeBase64 } from "tweetnacl-util";

class Credentials {

    /*credential = {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://www.w3.org/2018/credentials/examples/v1"
        ],
        "id": "https://example.com/credentials/1872",
        "type": ["VerifiableCredential", "AlumniCredential"],
        "issuer": "https://example.edu/issuers/565049",
        "issuanceDate": "2010-01-01T19:23:24Z",
        "credentialSubject": {
            "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
            "alumniOf": "Example University"
        }
    };*/
    static async createVerifiableCredential(credential, issuer) {
        // Create the payload
        const vcPayload = {
            sub: issuer.did,
            vc: credential
        };

        // Create the verifiable credential
        return await createVerifiableCredential(vcPayload, issuer);
    }

    static async createVerifiablePresentation(vcJwts, issuer) {
        const vpPayload = {
            vp: {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                type: ['VerifiablePresentation'],
                verifiableCredential: vcJwts
            }
        };
          
        return createPresentation(vpPayload, issuer);
    }

    static async verifyPresentation(vpJwt) {
        let resolver = Credentials._getResolver();
        return verifyPresentation(vpJwt, resolver);
    }

    static async verifyCredential(vcJwt) {
        let resolver = Credentials._getResolver();
        return verifyCredential(vcJwt, resolver);
    }

    static async createIssuer(user) {
        // Get the current user's keyring
        const appConfig = await user.getAppConfig();
        let keyring = appConfig.keyring;

        let privateKey = encodeBase64(keyring.signKey.privateBytes);

        let signer = didJWT.NaclSigner(privateKey);
        const issuer = {
            did: appConfig.vid,
            signer,
            alg: "Ed25519"  // must be this casing due to did-jwt/src/JWT.ts
        };

        return issuer;
    }

    static _getResolver() {
        return new Resolver(getResolver());
    }

}

export default Credentials;