# Welcome to Verida Datastore

**Note: Verida Datastore is in active development with an alpha release coming Q1 2020**

The Verida Datastore enables developers to quickly build self-sovereign applications &mdash; allowing users to own their own data. The system is distributed by design, enabling user data to be stored on Verida infrastructure, a user's own infrastructure or use third party hosting providers.

Verida Datastore provides an easy to use library that abstracts the complexities of encryption, permissioning, schema management and user management.

Applications can access user data once unlocked by a users blockchain wallet (ie: Ethereum, VeChain).

Applications can store unstructured data, but are encouraged to use the built-in data schemas pre-defined by Verida (or develop their own custom schemas). This ensures all applications built using Verida Datastore can interoperate together with data of a particular type created in one application available in all other applications that support that data type.

The Verida Datastore is the first component in a broader ecosystem of open source tools being developed by Verida.

## Getting Started

### [Datastore library](http://www.github.com/verida/datastore)

This nodejs library which provides a drop in self sovereign data storage solution for any web application.

Install into your application:

```
npm install verida/datastore
```

Create an application instance and ask the user to authorize your application:

```
import VeridaApp from 'verida/datastore';

let config = {};
let myApp = new VeridaApp("My Application Name", config);
await myApp.connectUser();
```

At this point a popup will appear asking the user to authorise the application. This is effectively signing into the application.

Example: Save the user's email address to their public profile:

```
let response = myApp.save("profile", {
  key: "email",
  value: "user@test.com"
}
console.log(response);
```

Example: Save a record of employment to the user's private document database:

```
let response = myApp.save("employment", {
  organisationName: "Google",
  position: "Product Manager",
  startDate: "2015-10-12",
  endDate: "206-03-9"
});
console.log(response);
```

Example: Fetch employment documents where the user had the position `Product Manager`:

```
let profileData = myApp.getMany("profile");
let employmentData = myApp.getMany("employment", {position: "Product Manager"});
```

# Architecture

Verida Datastore is designed with the following principles:

- Security must not be compromised
- Put the user first
- Use existing standards where possible
- Embrace open source software principles
- Suitable for Enterprise use
- Write once, use everywhere
- Blockchain agnostic where possible
- Streamline on-boarding for users and developers

Here is an overview of the key architecture decisions and features in the pipeline. The Verida Datastore is in active development, so many of these capabilities are not yet implemented.

## Security

Security is built into the core of the architecture, providing for many different ways data can be secured:

- **Private data:** Only the user can read and write (ie: Birth certificate document)
- **Public read and write:** Any user can read and write data (ie: Public comment thread)
- **Public read and restricted write:** Only the user can write, but the public can read data (ie: Public blog)
- **Restricted read and restricted write:** Only an approved list of users can read and write (ie: Private group chat)

All non-public data is encrypted using keys only accessible by the user(s) who have access to that particular data.

## Identity

Users are identified using a [decentralised identifier (DID)](https://w3c.github.io/did-core/). These are basically blockchain addresses (ie: 0xf3beac30c498d9e26865f34fcaa57dbb935b0d74) that are known to be controlled by the user.

A user identifies themselves by providing their blockchain address in the DID format that also specifies the blockchain being used.

ie: `did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74`

## Authorization

A user authorizes an application by signing a known message using their blockchain wallet.

For example, an application making a request to the `connectUser()` method in the Verida Datastore will cause a popup appear asking the user to sign a message `"My Application Name" (www.myapplication.com) is requesting access to 0xf3beac30c498d9e26865f34fcaa57dbb935b0d74`.

This signed message is then used as a synchronous encryption key to unlock the users encryption keys for the current application.

## Databases

Data is stored in both a user's `master` database and an `application` specific database. These two database are then kept in sync &mdash; *See Data Synchronisation (below)*

### User's Master Database

Each user has a `master` database that contains all their data. This data is encrypted (unless public) by encryption keys specific for this master database that can only be unlocked when a user accesses their Verida Data Wallet.

### User's Application Databases

Application's have separate user databases. This data is encrypted (unless public) by encryption keys specific for the application. This data can be unlocked when a user access the application or when a user access their Verida Data Wallet.

### Data Storage

Under the hood a combination of [CouchDB](https://en.wikipedia.org/wiki/Apache_CouchDB) and [PouchDB](https://pouchdb.com/) is used to store user data. Here's why that combination was chosen over other options:

- CouchDB was released in 2005. It is well supported and battle hardened over the years. This meets the principle: `Suitable for Enterprise use`.
- CouchDB supports multi-master replication and multi-version concurrency control (MVCCC) making it ideally suited to synchronise data between applications. This meets the principle: `Write once, use everywhere`.
- CouchDB supports custom user permissions. This meets the principle: `Security must not be compromised`.
- PouchDB is a Javascript implementation of CouchDB that can run within a web browser (or mobile app) enabling user data to be encrypted within the web browser before being sent to CouchDB, while still enabling full database query support of the encrypted data. This meets the principles: `Security must not be compromised` and helps on-board new developers by providing well known query capabilities.

At the end of the day, data must be physically stored somewhere. Verida Datastore is designed to empower user's to control where their data is stored. This meets the principle: `Put the user first`.

### Hosting

Verida currently provides infrastructure for storing user's master database and application databases. This will be opened up in the future allowing any user or application developer to host their own data (or use third party hosting providers).

This meets the principle: `Streamline on-boarding for users and developers`.

## Data Schemas

While data is stored in a NoSQL database, the architecture is designed to support [JSON Schema](https://json-schema.org/) definitions. This enables:

- Data of a particular type created in one application can be used in another application (ie: Fitness data can be shared across multiple fitness apps)
- Data can be validated before storing in the user's database
- Data can be queried in a consistent way
- Data can be grouped together by type for permissioned sharing between apps

Verida Datastore provides a set of base schemas for interoperability between applications.

Application developers can contribute to the base schemas or develop their own private schemas.

For maximum flexibility, an application can create customer user databases which provide a raw CouchDB compliant user database to store any schema-less data.

## Data Synchronisation

Applications built with Verida Datastore store user data in two places; The user's master database **and** a user's application database.

This is done to ensure security of user's data as it prevents applications directly accessing a user's master database. Each application has separate encryption keys for enhanced security.

A user must use the Verida Data Wallet to decrypt any new application data, re-encrypt it using their master database encryption keys and save to their master database. This is done automatically when they login to their Verida Data Wallet.

The synchronisation process is facilitated via the CouchDB replication protocol. Data from multiple applications using the same schemas can be synchronised into a single user master database with minimal conflicts &mdash; it's basically like a `git merge` for the user's application databases. This process also works in reverse &mdash; relevant data from a user's master database is synchronised with the user's application database.

When a user connects to an application for the first time, the application will send an encrypted message to the user's public inbox, providing information about the new application. This includes details of the database cluster(s) where the application data can be found and any permission requests for syncing user's master data with the application. The user then saves this information to their master database in a list of applications where data can be synchronised.

## Data Querying

The majority of solutions in this space provide simple `key` / `value` storage options. Through the use of the `CouchDB` database backend and JSON schemas, Verida Datastore supports querying user data as you would expect from a typical NoSQL database.

Example: Fetch all runs a user has completed in 2018

```
let employmentData = myApp.getMany("health/activity", {
  type: "run",
  date: {
    "$gte": "2018-01-01"
  }
});
```

# Verida Projects

Also see:

- [Verida Datastore Demo](http://www.github.com/verida/datastore-demo)
- [Verida Schemas](http://www.github.com/verida/schemas)
- [Verida Datastore Server](https://github.com/verida/datastore-server)