
## Requesting Data

Data is requested by sending a user an inbox message, which can then be accepted or rejected.

### Request once-off access

Data can be requested once-off. For example, you may request a user to provide their date of birth and email or their digital passport:

```
// Define a callback function that logs the result of the inbox request
let cb = function(response) {
    console.log(response);
};

// Generate a request for a user's date of birth and email from their private profile
let dobRequest = {
    "userSchema": "profile/private",
    "filter": {
        "key": {
            "$or": [
                "dateOfBirth"
                "email"
            ]
        }
    }
    "schema": "inbox/request/data"
};

await app.inbox.send(userDid, dobRequest, {
    callback: cb
});

// Generate a request for a user's passport
let passportRequest = {
    "userSchema": "identity/passport",
    "schema": "inbox/request/data"
};

await app.inbox.send(userDid, passportRequest, {
    callback: cb
});
```


### Request sync access

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