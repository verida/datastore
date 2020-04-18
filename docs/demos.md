# Examples

See [datastore-demo](https://github.com/verida/datastore-demo) git repo.

```
npm install
npm run serve:<demo-name>
```

## Credentials (id-verify-demo)

This demo pretends you are a government employee and logging into a decentralised credential management system. You send a credential to another user by providing the user's decentralized ID (DID) and sending them an inbox message with the credential. The user then saves the credential to their Vault, where they can then share it with others.

How to use the demo:

1. Open the Verida Vault (https://vault.testnet.verida.io/) and connect using Metamask to create your decentralised account (if you haven't already). This is your personal vault.

2. Clone the demo and run it

```
git checkout https://github.com/verida/datastore-demo
cd datastore-demo
npm run serve:id-verify-demo
```

3. Load the demo (http://localhost:8080/) and connect. Make sure you use a different browser window, with a different Ethereum account. This is your "government employee" account.

5. Click `Create Citizen Verification` in the heading. Enter the DID of your personal account (`did:ethr:0xee....` from the Verida Vault profile page) to create a new credential. Fill in the form and click `Submit`.

!> Note: There's a temporary bug with date of birth, so leave that blank.

6. Go back to your browser window that has the Verida Vault open and you will see a new inbox message. Click your `inbox` and then `Accept` to save the credential. Click on `Identity` in the left navigation and you will now see your saved credential.

## Retail (retail-demo)

This demo shows:

- Creating a Digital Receipt and sending it to a user
- Creating a Digital Coupong and sending it to a user
- Requesting a private, extended profile from a user

How to run the demo:

```
npm run serve:receipt-demo
```

## Health (health-demo)

Coming soon

## Contacts

Coming soon

## Chat room

Coming soon