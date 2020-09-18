# Messaging

## Overview

Every application has a built-in `inbox` for receiving messages and `outbox` for sending messages. This allows users and applications to send data between each other knowing nothing than the other user's DID and application name.

### Inbox

Your application can register a callback function to listen for new inbox messages:

```
app.inbox.on('newMessage', function(inboxEntry) {
    console.log('New inbox message received', inboxEntry);
})
```

The `inboxEntry` object utilises the `inbox/entry` schema. The two most important properties are:

- `type` &mdash; The type of inbox entry. This references a full schema URL.
- `data` &mdash; The data contained in the inbox entry. This will be an object adhering to the schema specified in `type`.

### Outbox

Your application can send messages to other application users (either your own application or another application). This example sends a contact record to a user's Verida Vault.

```
const did = 'did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74';
const type = 'inbox/type/dataSend';

// Generate an inbox message containing an array of data
const data = {
    data: [
        {
            firstName: 'Vitalik',
            lastName: 'Buterin',
            email: 'me@vitalik.eth',
            schema: 'https://schemas.verida.io/social/contact/schema.json'
        }
    ]
};
const message = 'Sending you a contact';
const config = {
    appName: 'Verida: Vault'
};

app.outbox.send(did, type, data, message, config)
```

This could be used in two scenarios:

- A user sending their own data from one application they control to another
- A user sending data to another user within the same application

!>You may receive the error message <strong>Unable to locate VID for "Application Name"</strong>. This will happen if the DID has not created an account on the application, so there's no inbox to send to.

## Built-in Message Types

See [Github schemas repository](https://github.com/verida/schemas/tree/master/schemas/inbox/type) for details on each supported inbox message type.

- [dataSend](https://github.com/verida/schemas/blob/master/schemas/inbox/type/dataSend/schema.json) &mdash; Send one or many pieces of data to a user
- [dataRequest](https://github.com/verida/schemas/blob/master/schemas/inbox/type/dataRequest/schema.json) &mdash; Request data from a user, supports optional filters and conditions around user's selecting data

## Examples

TODO: Add more examples on requesting data; single record, multiple records, filters. Add example for syncronization request.
