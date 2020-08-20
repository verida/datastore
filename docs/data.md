# Data

This section demonstrates how Databases and Datastores work in Verida.

## Databases

All databases in Verida are **User Databases**. They are owned by a specific user who controls the database permissions. These databases are encrypted using private keys only known by the user (except for public databases).

As such, application owners don't have access to this data. This ensures user data is private, owned and controlled entirely by the user.

There is no concept of a `central` database, however many applications need to access aggregated data. Traditional API's and databases can be used for this purpose, however it must be made clear to a user when their data is being copied in that way.

We have some early thoughts on how to provide privacy preserving aggregated data for applications, but they are not a current priority.

Applications can have an unlimited number of databases.

### Using Databases

Open a user database and fetch some rows:

```
let db = await app.openDatabase('test_db');
let item = await db.save({
  hello: 'world'
});
let items = await db.getMany();
console.log(items);
```

The database will be created if it doesn't exist.

It's possible to create public databases and connect to other user's public database. We are working on permissioned databases where the database owner can control who has read or write access.

?>See [Permissions](#Permissions), [App.openDatabase()](http://apidocs.datastore.verida.io/App.html#openDatastore), [Database.getMany()](http://apidocs.datastore.verida.io/Database.html#getInstance) for configuration details.

!>We **DO NOT** recommended using databases directly. You are better off using Datastores to ensure your data is validated against a schema and can be interoperable with other applications.

## Datastores

In a world where users own their own data, it's important their data is portable between applications. Otherwise we end up with the current situation of data silos, where user data is scatterred across lots of different applications.

Verida solves this problem by creating databases with a defined schema, called `Datastores`. This ensures data interoperability between applications.

Using schemas also ensures data is validated before saving. This ensures data is of the correct format and required fields are defined.

See [Schemas](/Schemas.html) for details on how the **standard** Datastore schemas provided and how to build custom schemas for your application.

### Open a Datastore

Lets demonstrate by opening the datastore using the `social/contact` schema, saving a row and fetching the results:

```
let contactsDs = await app.openDatastore('social/contact');
let contact = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'john@smith.com'
}
await contactsDs.save(contact);

let contacts = await contactsDs.getMany();
console.log(contacts);
```

### Querying

Datastores support a full range of query functionality, including; Filters, Limit, Offset and Sort:

```
let filter = {
  organization: 'Google'
};

let options = {
  limit: 20,
  skip: 0,
  sort: ['firstName']
};

let results = contactsDs.getMany(filter, options);
console.log(results);
```

!>Sorting only works if an index has been defined for the field being sorted. Indexes are defined in the Datastore schema. See [Schemas](/#/schemas.html) for details.

?>See [Datastore.getMany()](http://apidocs.datastore.verida.io/DataStore.html#getMany)

#### Pagination

The underlying database is based on CouchDB which doesn't provide a way to count the total number of results. Instead it uses a `bookmark` property that can be used to fetch the next page of results.

This can be used as follows:

```
let filter = {
  organization: 'Google'
};

// Configure our page size (20), start position (0) and request to return the
// raw result set, which will provide us with a `bookmark` we can use to fetch
// the next page of results.
let options = {
  limit: 20,
  raw: true
};

let page1 = contactsDs.getMany(filter, options);
console.log(page1.docs);

// Request the next 
options.bookmark = page1.bookmark;
let page2 = contactsDs.getMany(filter, options);
```

### Saving

Use the [save()](http://apidocs.datastore.verida.io/global.html#DataStore#save) method to save new records to a database or datastore. If the `save()` fails, you can find an array of errors in the `.errors` property.

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
```

### Deleting

You can delete a record using it's ID:

```
await contactsDb.delete(contact._id);
```

In order to delete a row, the revision (`_rev`) is required. If you delete just using the record ID, behind the scenes the latest `_rev` value is fetched from the database to enable the delete.

Alternatively, if you already have the full record, you can pass it to the `delete()` method:

```
await contactsDb.delete(contact);
```

## Permissions

When a database is created, you specify the `read` and `write` permissions, out of a possible 3 options:

- `public` &mdash; Everyone has permission
- `users` &mdash;  Only the specific list of users have permission
- `owner` &mdash;  Only the owner has permission

Here are some real world examples:

- For private health data, set `read=owner`, `write=owner` so the data is completely private.
- For a public comment thread, set `read=public`, `write=public` so anyone can read and write comments.
- For a public blog post, set `read=public`, `write=owner` so the blog owner can publish new posts and the public can read them.
- For a private group chate, set `read=users`, `write=users` so only a pre-determined set of users can read from and write to the group chat.

Permissions are specified when opening a `database` or `datastore`:

```
let permissions = {
  read: 'owner',
  write: 'owner'
}

// Open a database
let privateDb = await app.openDatabase('private/data', app.user.did, {
  permissions: permissions
});

// Open a datastore
let healthNotes = await app.openDatastore('health/note', app.user.did, {
  permissions: permissions
});
```

When specifying the `users` permission type, you must also specify the list of valid user DID's with `userList`:

```
let permissions = {
  read: 'users',
  readList: ['did:ethr:0xefa01d332...', 'did:ethr:0xcfa01d332...'],
  write: 'users',
  writeList: ['did:ethr:0xefa01d332...', 'did:ethr:0x1fa01d332...']
}

// Open a database
let restrictedDb = await app.openDatabase('restricted/data', app.user.did, {
  permissions: permissions
});
```

!>Note: `users` permission type is not fully implemented in the alpha, so don't use just yet.

!>Note: Assigning a database `write=public` currently results in `read=public` also being applied. This is an issue caused by CouchDB not supporting a user having `write` access, but not `read` access. It's expected a modified version of CouchDB will be used to work around this current limitation in production environments.

Databases are unique based on a hash of their `name` combined with their `permissions`. You could open two databases with the same name, but different permissions and they would be different databases.

## Advanced

### Datatore or Database?

You can access the underlying `Database` object from a `Datastore` object:

```
let db = await datastore.getDb();
```

The Verida Database object is a wrapper around a native [PouchDb instance](https://pouchdb.com/api.html). You can fetch this PouchDb instance from a `Database` object:

```
let pouchDb = await db.getInstance();
```

### Indexes

TBA

### Realtime changes

Once a `datastore` or `database` is opened, you can bind to the `change` event that fires everytime data changes on the underlying database.

```
let db = await datastore.getDb();
db = await db.getInstance();
db.changes({
    since: 'now',
    live: true
}).on('change', function(info) {
    if (info.deleted) {
        // Do something on delete
        return;
    }

    // Do something on insert / update
}).on('error', function(err) {
    console.log("An error occurred watching for inbox changes");
    console.log(err);
});
```

!>**Caution:** The Verida Datastore library aims to be database agnostic. In the near future, database watching will be modified to support native Javascript change events instead of relying on PouchDb specific code like this.

?>See [PouchDB Changes](https://pouchdb.com/api.html#changes)

### Shared Databases

It's possible to create public databases for shared data across all users.

Here is an overview of the process:

1. Create a DID for your application. This will be the DID that "owns" the shared database that everyone will access.
2. Create the shared database using your application DID account.
3. Enable your users to connect and read / write from this shared database.

#### 1. Create a DID for your application

This is a simple as creating a new Ethereum account using Metamask

#### 2. Create a shared database

You only need to do this once to "seed" your application database. This ensures it is created with the appropriate permissions.

Open your application and open the Javascript console:

```
let db = await app.openDatabase(dbName, did, {
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
let db = await app.openDatabase(dbName, did, {
  permissions: {
    read: "public",
    write: "public"
  }
});

let results = await db.getMany();
```

?>The steps above create a generic schemaless database. It's possible to define your own application schema the shared database will use and then use `app.openDatastore()`.

?>Alternatively, for a more traditional approach you could create a database with `write=owner`, `read=public` and use an API to write data to the shared database.