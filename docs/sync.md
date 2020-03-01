# Syncronising Data

TBA

## Overview

## Request sync access (syncRequest)

Data can be requested to sync on an ongoing basis. This allows you to easily access a user's data &mdash; even when it changes. It also allows you to write data and have it automatically update their master Verida Data Wallet, which in turn updates any other applications using that same data.

```
// Define a callback function that logs the result of the inbox request
let cb = function(response) {
    console.log(response);
};

// Generate a request to syncronise a user's contact list with this application
let contactRequest = {
    "userSchema": "social/contact",
    "filter": {},
    "permissions": {
        "read": true,
        "write": true
    }
    "schema": "inbox/request/sync"
};

await app.inbox.send(userDid, contactRequest, {
    callback: cb
});

// Generate a request to syncronise a read only copy of a user's height data
let heightRequest = {
    "userSchema": "health/measurment",
    "filter": {
        "type": "height"
    },
    "permissions": {
        "read": true,
        "write": false
    }
    "schema": "inbox/request/sync"
}
```

!>Note: The example above is outdated and needs updating