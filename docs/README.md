# Welcome to Verida Datastore

!>Verida Datastore is currently Alpha and in active development. This is a preview release for developers to provide early feedback. Do **not** expect any data saved to be retained, unless you run your own dataserver. API's and data schemas are **highly** likely to change before an initial release.

## Quick links

Learn:

- [Quick Start](/#quick-start)
- [Guide](/guide)
- [Architecture](/architecture)
- [API Docs](http://apidocs.datastore.verida.io/)

Other links:

- [Github](https://github.com/verida)
- [Discord Chat](https://discord.gg/qb6vS43)
- [Verida Website](https://www.verida.io)

## Introduction

The Verida Datastore enables developers to quickly build self-sovereign applications &mdash; allowing users to own their own data.

Applications developed using Verida Datastore and using common schemas allow data to by shared / syncronised across all other applications used by the same user. This provides unparallelled data portability.

The system is distributed by design, enabling user data to be stored on Verida infrastructure, a user's own infrastructure or use third party hosting providers.

Verida Datastore provides an easy to use library that abstracts the complexities of encryption, permissioning, schemas and user management. Applications can access user data once unlocked by a users blockchain wallet (ie: Ethereum, VeChain).

Applications can store unstructured data, but are encouraged to use the built-in data schemas pre-defined by Verida (or develop their own custom schemas). This ensures all applications built using Verida Datastore can interoperate together with data of a particular type created in one application available in all other applications that support that data type.

The Verida Datastore is the first component in a broader ecosystem of open source tools being developed by Verida.

## Quick Start

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

### Open a Database

You can now open a private, encrypted database for the user. It will be created if it doesn't exist.

```
let db = await app.openDatabase('test_db');
let item = await db.save({
  hello: 'world'
});
let items = await db.getMany();
console.log(items);
```

It's also possible to create public databases and connect to other user's public database. We are also working on permissioned databases where the database owner can control who has read or write access.

?>See [Data Permissions](/Guide.html#Database-Permissions)

### Open a Datastore

In a world where users own their own data, it's important their data is portable between applications. Otherwise we end up with the current situation of data silos, where user data is scatterred across lots of different applications.

Verida solves this problem by creating databases with a defined schema, called `Datastores`. This ensures data interoperability between applications.

Lets demonstrate by opening the datastore using the `social/contact` schema:

```
let contactsDs = await app.openDatastore('social/contact');
let contact = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'john@smith.com'
}
let success = await contactsDs.save(contact);

if (!success) {
  console.error(contactsDb.errors);
} else {
  console.log("Contact saved");
}

let contacts = await contactsDs.getMany();
console.log(contacts);
```

### Syncing a Datastore

In the above example we have created a private, encrypted database in the context of our application. While, we're using a common `social/contact` schema, the data is still trapped within this application.

This data needs to be syncronized with any other contacts the user has. In this way, our application can instantly be populated with the user's existing contacts and **also** make changes to the user's contact list that will propogate across all other applications using the same `social/contact` datastore.

!>Example coming soon

## Getting a Public Profile

All users have a public profile that provides basic information (ie: name, avatar).

```
// Specify the DID of the user
let did = 'did:ethr:0x...';
let profile = await app.openProfile(did);

let allData = await profile.getMany();
let firstName = await profile.get('name');
```

?>This is entirely optional &mdash; Users can remain anonymous by not entering any public profile information.

### Receive Inbox Messages

Your application has an `inbox`, where other applications and other users can send encrypted messages to users. Your application can listen to new inbox messages and handle them as appropriate.

This effectively creates a secure Peer-to-Peer communication channel between all users.

!>Example coming soon