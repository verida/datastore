# Architecture

An outline of the Verida Datastore architecture and design decisions.

## Design Principles

Verida Datastore is designed with the following principles:

- Security must not be compromised
- Put the user first
- Use existing standards where possible
- Embrace open source software principles
- Suitable for Enterprise use
- Maximise data portability
- Write data once, access everywhere
- Blockchain agnostic where possible
- Streamline on-boarding for users and developers

The rest of this Architecture document provides an overview of the key design decisions and features.

?> The Verida Datastore is in active development, so some of these capabilities are not yet implemented.

## Application Architecture

<div>
  <div><img src="images/Verida Datastore Architecture - Overview.png" style="max-width: 75%" /></div>
</div>

The Verida Datastore provides encrypted per user databases for your application.

Here's is the basic flow.

### 1. Users authorize access

Users authorize access to your application by signing a consent message. See [initialization](initialization).

If this is the first time the user has authorized your application, a new DID document is created (see [identity](identity)).

This DID document includes the URI of the CouchDB database hosting the user's encrypted data along with public keys. The DID document is public, allowing other users and applications to discover user's database endpoints and public keys for securely sending data.

### 2. Create user databases

User databases have data stored in two locations:

- Locally, within the browser, using [PouchDB](https://pouchdb.com/)
- Remote, managed by the application developer or the user, using [CouchDB](https://couchdb.apache.org/)

When a database is created (via `app.openDatabase(...)`) a local unencrypted database is created in the browser and remote encrypted database is created on the remote CouchDB server.

Remote user databases are created by sending an API request to the Datastore Server. This server manages the underlying database permissions of the CouchDB database server.

All requests to the Datastore Server API must include a signed consent message by the user. This ensures only the user holding the private key of the public blockchain account can set their database permissions.

### 3. Reading and writing data

When a database is opened, the Verida Datastore connects to the encrypted remote database and syncronizes it's local copy, automatically decrypting the data into the unencrypted PouchDB database.

This allows your application to run queries within the browser on the decrypted data.

Any changes to data are syncronized in real-time between the local and cloud databases. Data is automatically decrypted / encrypted between the local database and the remote encrypted database.

## Decentralised self-hosting

The application architecture diagram above only shows one CouchDB server for the whole application which is obviously centralised. However, users can use their public blockchain private keys to update their DID document and point to a server they control.

<div>
  <div><img src="images/Verida Datastore Architecture - Per-User Databases.png" style="max-width: 75%" /></div>
</div>

In this updated diagram you can see there are 5 users. User 1 and User 5 have chosen to host their data on their own CouchDB server, whereas Users 2-3 are using the default CouchDB server provided by the application developer.

In this way, a simple onboarding exists for new users, while more advanced users can host their own data.

## Cross application data sharing

<div>
  <div><img src="images/Verida Datastore Architecture - Cross Application Data.png" style="max-width: 75%" /></div>
</div>

Data can be easily shared between different applications and users, provided you have access to the database.

User 5 of Application 1 can read / write to a database owned by User 1 of Application 2, provided they have the database URI, know the database name and have permission.

The database URI can be obtained from User 1's DID document. The database name will be known by the developer (ie: social/contacts) or be built into a shared schema being used by both applications.

## Security

Security is built into the core of the architecture, providing for many different ways data can be secured:

- **Private data:** Only the user can read and write (ie: Birth certificate document)
- **Public read and write:** Any user can read and write data (ie: Public comment thread)
- **Public read and restricted write:** Only the user can write, but the public can read data (ie: Public blog)
- **Restricted read and restricted write:** Only an approved list of users can read and write (ie: Private group chat)

All non-public data is encrypted using keys only accessible by the user(s) who have access to that particular data.

[Learn more about data permissions](data#permissions)

## Identity

Users are identified using a [decentralised identifier (DID)](https://w3c.github.io/did-core/). These are basically public blockchain addresses (ie: `0xf3beac30c498d9e26865f34fcaa57dbb935b0d74`) that are known to be controlled by the user.

A user identifies themselves by providing their blockchain address in the DID format that also specifies the blockchain being used as the anchor.

ie: `did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74`.

[Learn more about identity](identity#identity)

## Authorization

A user authorizes an application by signing a known message using their blockchain wallet.

An application making a request to the `datastore.connect()` method in the Verida Datastore will cause a popup appear asking the user to sign a message `Do you approve access to view and update "My Application Name"?`.

This signed message is then used as a synchronous encryption key to unlock the users keys for the current application.

!>For enhanced security, the per-application encryption keys are not stored anywhere. They can only be generated by a user signing the exact same message using their on chain address.

[Learn more about authorization](initialization#initialization)

## Data Storage

Under the hood a combination of [CouchDB](https://en.wikipedia.org/wiki/Apache_CouchDB) and [PouchDB](https://pouchdb.com/) is used to store user data. Here's why that combination was chosen over other options:

- CouchDB was released in 2005. It is well supported and battle hardened over the years. This meets the principle: `Suitable for Enterprise use`.
- CouchDB supports multi-master replication and multi-version concurrency control (MVCCC) making it ideally suited to synchronise data between applications. This meets the principle: `Write once, use everywhere`.
- CouchDB supports custom user permissions. This meets the principle: `Security must not be compromised`.
- PouchDB is a Javascript implementation of CouchDB that can run within a web browser (or mobile app) enabling user data to be encrypted within the web browser before being sent to CouchDB, while still enabling full database query support of the encrypted data. This meets the principles: `Security must not be compromised` and helps on-board new developers by providing well known query capabilities.

At the end of the day, data must be physically stored somewhere. Verida Datastore is designed to empower user's to control where their data is stored. This meets the principle: `Put the user first`.

## Data Schemas

While data is stored in a NoSQL database, the architecture is designed to support [JSON Schema](https://json-schema.org/) definitions. This enables:

- Data of a particular type created in one application can be used in another application (ie: A user's Contact list can be shared across multiple communication apps)
- Data can be validated before storing in the user's database
- Data can be queried in a consistent way
- Data can be grouped together by type, enabling permissioned sharing between apps

Verida Datastore provides a set of base / shared schemas for interoperability between applications. See [Schemas](schemas#schemas).

Application developers can submit push requests to contribute to the base schemas or develop their own schemas for their business or consortium of organisations.

?>For maximum flexibility, an application can create custom user databases to store any schema-less data specific for the application.

## Data Querying

The majority of decentralised data solutions in this space provide simple `key` / `value` storage options as querying encrypted databases is a significantly _hard_ problem.

The Verida Datastore architecture has the following features that facilitate querying of encrypted data in a consistent manner across many distributed databases:

- Using `CouchDB`compatible database syncronisation and merging
- Using common JSON schemas to ensure data consistency between distributed applications
- Encrypt / Decrypt data on the fly between multiple `CouchDB` compliant database backends, with different encryption keys for each

As a result, all applications implementing the Verida Datastore support querying user data as you would expect from a typical NoSQL database.

Example: Fetch all runs a user has completed in 2018

```
let employmentData = myApp.getMany("health/activity", {
  type: "run",
  date: {
    "$gte": "2018-01-01"
  }
});
```

## Data Synchronisation

Applications built with Verida Datastore can syncronize data between other users and other applications, using the CouchDB syncronization protocol.

Data from multiple applications using the same schemas can be synchronized automating conflict management. This works in a similar way to a `git merge`, but for database data.

[Learn more about data syncronization](sync#sync)