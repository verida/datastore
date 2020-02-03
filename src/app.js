/*eslint no-console: "off"*/
"use strict"

import Config from './config';

import VeridaUser from "./user";
import VeridaSchema from "./schema";
import DataServer from './dataserver';
import Inbox from "./inbox";
import WalletHelper from "./helpers/wallet";

const _ = require('lodash');

/**
 * @property {Wallet} wallet The current user's wallet.
 */
class App {

    /**
     * Create a new application.
     * 
     * @param {string} name Name of the application.
     * @param {object} [config] Configuration for the application. See `datastore/src/config.js` for default application configuration that can be customised with this `config` parameter.
     * @param {string} config.appServerUrl URL of the `datastore-server` instance for this application.
     * @param {string} config.userServerUrl URL of the `datastore-server` instance for the current logged in user. This will be deprecated once user self-management is implemented.
     * @param {string} config.dbHashKey Hash used for generating unique database names for this application. Set a unique value for your application.
     * @param {object} config.schemas An object with keys `basePath` and `customPath` that specify the location of data schemas.
     * @param {string} config.schemas.basePath Base path for common Verida Schemas. Defaults to `/schemas/`.
     * @param {string} config.schemas.customPath Path for custom schemas just for this application. Defaults to `/customSchemas/`.
     * @constructor
     * @example 
     * import VeridaApp from 'verida-datastore';
     * let myApp = new VeridaApp("My Application Name");
     * myApp.connect();
     */
    constructor(name, chain, address, web3Provider, config) {
        this.name = name;
        this.config = {
            didServiceUrl: window.location.origin
        };
        _.merge(this.config, Config, config);
        
        this.user = new VeridaUser(chain, address, web3Provider, this.config.didServerUrl);
        this._isConnected = false;

        this.inbox = new Inbox(this);

        this._schemas = {};
        this.dataservers = {
            // Connection to application's data server
            app: new DataServer(this, {
                datastores: this.config.datastores,
                serverUrl: this.config.appServerUrl,
                didUrl: this.config.didServerUrl
            }),
            // Connection to the user's data server (for accessing their profile)
            user: new DataServer(this, {
                appName: "Verida Wallet",
                isProfile: true,
                serverUrl: this.config.userServerUrl,
                didUrl: this.config.didServerUrl
            })
        };
    }

    /**
     * Connect a user to the application. Similar to "logging in" to an application. 
     * This will popup a metamask window asking the user to authorize the application.
     * 
     * The user will remain logged in for all subsequent page loads until `app.logout()` is called.
     */
    async connect() {
        if (this._connected) {
            throw "Application is already connected";
        }

        await this.dataservers.app.connect();
        this._isConnected = true;
    }

    /**
     * Logout a user.
     */
    disconnect() {
        this.dataservers.app.logout();
        this.dataservers.user.logout();
        this._isconnected = false;
    }

    async isConnected() {
        return this._isConnected;
    }

    /**
     * Open an application datastore.
     * 
     * @param {string} schemaName
     * @param {object} [config] Optional data store configuration
     * @returns {DataStore} Datastore instance for the requested schema
     */
    async openDatastore(schemaName, config) {
        // TODO: Add schema specific config from app config or do it in openDatastore?
        return this.dataservers.app.openDatastore(schemaName, this.user.did, config);
    }

    /**
     * Opens the profile of another user in read only mode
     * 
     * @param {*} did
     * @example
     * let profile = app.openProfile(userDid);
     * console.log(profile.get("email"));
     * @returns {DataStore} Datastore instance for the requested user profile
     */
    async openProfile(did) {
        // TODO: Create smart contract that maps DID's to dataservers and
        // dynamically build a dataserver specific for the requested user

        //let vid = getVid("Verida Wallet", did);
        //let dataserverUrl = vid.getAttribute("dataserver");
        //let dataserver = this.buildDataserver(dataserverUrl);
        let dataStore = await this.dataservers.user.openDatastore("profile", did, {
            permissions: {
                read: "public",
                write: "owner"
            },
            readOnly: true
        });

        return dataStore;
    }

    /**
     * Get a JSON Schema object by name
     * 
     * @param {string} schemaName 
     * @returns {Schema}
     */
    async getSchema(schemaName) {
        if (!this._schemas[schemaName]) {
            this._schemas[schemaName] = new VeridaSchema(schemaName, this.config.schemas);
        }

        return this._schemas[schemaName];
    }

}

App.WalletHelper = WalletHelper;
export default App;