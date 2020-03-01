# Hosting

TODO: Outline how data is hosted / stored, how to host own data.

## Application Data

Provide a default hosting option for your application users

## User Data

Host your own application data

## Notes

### Too many sockets

Applications built using `Verida Datastore` open a long polling socket for each user database that is opened. If your application has multiple databases open at once, you will quickly hit Google Chrome's maximum of 6 open connections per host.

You can avoid hitting this limit by ensuring the Dataserver is using HTTP/2. This can be achieved by using an AWS load balancer in front of the Dataserver or use HAProxy.