/*eslint no-console: "off"*/
"use strict"

import Config from './config';

import VeridaUser from "./user";
import VeridaSchema from "./schema";
import Wallet from './wallet';
import DataServer from './dataserver';

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
    constructor(name, config) {
        this.name = name;
        this.config = {};
        _.merge(this.config, Config, config);
        
        this.user = null;

        this.wallet = new Wallet(this);

        this._schemas = {};
        this.dataservers = {
            // Connection to application's data server
            app: new DataServer(this, {
                datastores: this.config.datastores,
                serverUrl: this.config.appServerUrl,
                didUrl: this.config.didServerUrl,
                dbHashKey: this.config.dbHashKey,
            }),
            // Connection to the user's data server (for accessing their profile)
            user: new DataServer(this, {
                appName: "Verida Wallet",
                isProfile: true,
                serverUrl: this.config.userServerUrl,
                didUrl: this.config.didServerUrl
            }),
        };
    }

    /**
     * Connect a user to the application. Similar to "logging in" to an application. This will popup a metamask window asking the user to authorize the application.
     * 
     * The user will remain logged in for all subsequent page loads until `app.logout()` is called.
     */
    async connect() {
        if (this.user) {
            throw "User already exists, disconnect first";
        }

        this.user = new VeridaUser(this);
        await this.user.init();
        await this.dataservers.app.connect();
    }

    /**
     * Logout a user.
     */
    disconnect() {
        this.dataservers.app.logout();
        this.dataservers.user.logout();
        this.user = null;
    }

    isConnected() {
        return this.user == null;
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

        return this.dataservers.user.openDatastore("profile", did, {
            permissions: {
                read: "public",
                write: "owner"
            },
            readOnly: true
        });
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

export default App;