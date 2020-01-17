# Welcome to Verida Datastore

**Note: Verida Datastore is in active development with an alpha release coming Q1 2020**

## Quick links

Learn:

- [Getting Started](http://docs.datastore.verida.io/#/?id=getting-started)
- Guide (Coming soon)
- [Architecture](http://docs.datastore.verida.io/#/architecture)
- [API Docs](http://apidocs.datastore.verida.io/)

Other links:

- [Github](https://github.com/verida)
- [Discord Chat](https://discord.gg/qb6vS43)
- [Verida Website](https://www.verida.io)

## Introduction

The Verida Datastore enables developers to quickly build self-sovereign applications &mdash; allowing users to own their own data. The system is distributed by design, enabling user data to be stored on Verida infrastructure, a user's own infrastructure or use third party hosting providers.

Verida Datastore provides an easy to use library that abstracts the complexities of encryption, permissioning, schema management and user management.

Applications can access user data once unlocked by a users blockchain wallet (ie: Ethereum, VeChain).

Applications can store unstructured data, but are encouraged to use the built-in data schemas pre-defined by Verida (or develop their own custom schemas). This ensures all applications built using Verida Datastore can interoperate together with data of a particular type created in one application available in all other applications that support that data type.

The Verida Datastore is the first component in a broader ecosystem of open source tools being developed by Verida.

## Getting Started

This library which provides a drop in self sovereign data storage solution for any web application.

Install into your application:

```
npm install verida/datastore
```

Create an application instance and ask the user to authorize your application:

```
import VeridaApp from 'verida/datastore';

let myApp = new VeridaApp("My Application Name");
await myApp.connect();
```

At this point a popup will appear asking the user to authorise the application. This is effectively signing into the application.

**Example: Fetch the users contact list**

```
let contactsDs = await myApp.openDatastore("social/contacts");
let contacts = await contactsDs.getMany();
console.log(contacts);
```

See [DataStore.getMany()](http://apidocs.datastore.verida.io/DataStore.html#getMany)

**Example: Save a new contact to the user's contact list:**

```
let contactsDb = await myApp.openDatastore("social/contacts");
let success = await contactsDb.save({
  firstName: "Jane",
  lastName: "Doe",
  did: "0xefac8e8..."
});

if (!success) {
  console.error(contactsDb.errors);
} else {
  console.log("Contact saved");
}
```

See [DataStore.save()](http://apidocs.datastore.verida.io/DataStore.html#save)

**Example: Fetch all contacts that work at `Google` and have a DID:**

```
let contactsDb = await myApp.openDatastore("social/contacts");
let contacts = contactsDb.getMany({
  company: "Google"
  did: {
    $exists: true
  }
});
```

See [DataStore.getMany()](http://apidocs.datastore.verida.io/DataStore.html#getMany)

**Example: Get and set the user's email address on public profile:**

```
// Get the user's email from their public profile
let email = myApp.wallet.profile.get("email");
console.log(email);

// Set the user's email on their public profile
myApp.wallet.profile.set("email", "user@test.com");
```

See [Profile](http://apidocs.datastore.verida.io/Profile.html)