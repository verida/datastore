# Welcome to Verida Datastore

**Note: Verida Datastore is in active development with an alpha release coming Q1 2020**

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

let config = {};
let myApp = new VeridaApp("My Application Name", config);
await myApp.connect();
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