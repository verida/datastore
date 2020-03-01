# Initialization

This NodeJs library provides a drop in self sovereign data storage and communication platform for any web application.

Install into your application:

```
npm install @verida/datastore
```

### Initialize Application

Create an application instance and ask the user to authorize your application:

```
import Verida from '@verida/datastore';

// Fetch the users web3Provider and address
const web3Provider = await Verida.WalletHelper.connectWeb3('ethr');
const address = await Verida.WalletHelper.getAddress('ethr');

let app = new Verida('Your Application Name', 'ethr', address, web3Provider);
```

At this point, the user will be asked to connect Metamask to your application (if they haven't already).

You now have an application instance that allows you to create databases, access other user's public profiles and receive data via the user's application inbox.

See [App API Docs](http://apidocs.datastore.verida.io/App.html) for additional configuration options.

?>Note: You don't have to use the rather basic `Verida.WalletHelper`, it's possible to use your own code to locate the user's web3Provider and address.

### Authorize Application

You can now connect the user to your application:

```
let connected = await app.connect(true);
```

A popup will appear asking the user to sign a consent message authorizing the application to use their data. The first time a user connects, the Datastore library will create new encryption keys that are used by this user and this application only.

Once complete, the user is logged into the application.

You can access the user's DID via:

```
console.log(app.user.did);
```