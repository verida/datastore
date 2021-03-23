
2021-03-23 (0.7.0)
--------------------

- Feature: Add NEAR support
- Feature: Add Vault based login support via QR code
- Feature: Add basic profile caching
- Feature: Add support for inbox `inboxChange` event
- Feature: Improve schema docs
- Fix: Sync issue caused by multiple events
- Fix: Don't log inbox sync errors

2020-11-29 (0.6.3)
--------------------

- Fix: Force VID to be a string
- Fix: Don't make _isConnected call connect(), just return state variable
- Fix: Allow private key instantiation to work on web
- Fix: Invalid error message if no web3 provider provided
- Fix: Create database if it doesn't exist


2020-11-08 (0.6.2)
--------------------

- Enable saving without signing
- Support updating the read / write list for a user database
- Fix: dbManager being incorrectly referenced for external databases
- Ensure databases only sync after replication has been completed
- Fix: Inbox issue with items that come in quick succession
- Support inbox garbage collection
- Fix: Don't syn design documents
- Support forcing a database update when calling `save()`
- Fix: Make `user.createDidJwt` properly use Nacl signer
- Refactor to support both instance and static methods
- Support setting appName within a verida datastore instance

2020-09-13 (0.6.1)
--------------------

- Update verida dependencies to latest
- Add webpack build

2020-08-26 (0.6.0)
--------------------

- Upgrade to ethers 5.0.9
- Update Vault appname to be `Verida: Vault`
- Update documentation
- Fix keyring verifiy signature method
- Refactor to use `@verida/encryption-utils` library
- Fix DID resolver format issue
- Fix generated DID document not returning with a valid proof
- Ensure profile manager doesn't error if no profile data

2020-07-12 (0.5.1)
--------------------

- Migrate DID chain format from `vid` to `verida`
- Add support for Vechain (server-side only)
- Upgrade to ethers 5.0
- Refactor to use @verida/wallet-utils
- Update to @verida/did-helper 0.5.0
- Simplify HDNode creation using ethers wallet
- Don't attempt to create a public database if not the owner

2020-04-05 (0.4.0)
--------------------

- Fix bugs impacting schema
- Support signing data when inserting into external databases
- Better outbox error logging 

2020-03-20 (0.3.1)
--------------------

- Adjust how schema paths are configured
- Bug fix query sort issues, server user initialisation
- Code cleanup and adding documentation