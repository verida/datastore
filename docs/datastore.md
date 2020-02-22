# Datastore

TODO: Describe the datastore

## Using Datastores

### Opening

### Querying

### Saving

### Deleting

### Watching for changes

### Permissions

## Databases

### Database v Datastore

### Shared Database

It's possible to create public shared databases, for example creating a directory of all the users of your application.

Here is an overview of the process:

1. Create a new blockchain account for your application. This will be the DID that "owns" the shared database that everyone will access.
2. Create the shared database using your application DID account.
3. Enable your users to connect and read / write from this shared database.

#### 1. Create a new blockchain account for your application

This is a simple as creating a new Ethereum account using Metamask

#### 2. Create a shared database

You only need to do this once to "seed" your application database. This ensures it is created with the appropriate permissions.

Open your application and open the Javascript console:

```
let db = await veridaApp.dataserver.openDatabase(dbName, did, {
  permissions: {
    read: "public",
    write: "public"
  }
});

let results = await db.getMany();
```

Where `dbName` is the name of your shared database and `did` is the DID you created in step 1 (ie: `did:ethr:0xefa....`).

#### 3. Enable users to access the shared database

You can now write code for your application to read and write from this shared database:

```
let db = await veridaApp.openDatabase(dbName, did, {
  permissions: {
    read: "public",
    write: "public"
  }
});

let results = await db.getMany();
```

?>The steps above create a generic schemaless database. It's possible to define your own application schema the shared database will use and then use `veridaApp.openDatastore(..)`.

?>Alternatively, for a more traditional approach you could create a database with `write=owner`, `read=public` and use an API to write data to the shared database.