
## Readme.md

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