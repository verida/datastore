2020-05-12 (0.5.0)
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