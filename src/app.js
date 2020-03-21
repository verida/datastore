/*eslint no-console: "off"*/
"use strict"

import Config from './config';
import VeridaUser from "./user";
import VeridaSchema from "./schema";
import DataServer from './dataserver';
import Inbox from "./messaging/inbox";
import Outbox from "./messaging/outbox";
import WalletHelper from "./helpers/wallet";
import VidHelper from "./helpers/vid";
import Profile from './profile';

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
     * @param {string} config.environment The environment to run the application in. Current options are; "dev", "alpha", "custom".
     * @param {string} config.dbHashKey Hash used for generating unique database names for this application. Set a unique value for your application.
     * @param {object} config.schemas An object with keys `basePath` and `customPath` that specify the location of data schemas.
     * @param {string} config.schemas.basePath Base path for common Verida Schemas. Defaults to `/schemas/`.
     * @param {string} config.schemas.customPath Path for custom schemas just for this application. Defaults to `/customSchemas/`.
     * @param {string} config.appServerUrl URL of the `datastore-server` instance for this application (overrides `config.environment` defaults)
     * @param {string} config.didServerUrl URL of the `did-server` instance used for DID document management (overrides `config.environment` defaults)
     * @constructor
     * @example 
     * import VeridaApp from 'verida-datastore';
     * let myApp = new VeridaApp("My Application Name");
     * myApp.connect(true);
     */
    constructor(name, chain, address, web3Provider, config) {
        this.name = name;

        // Build default config
        let defaults = {
            didServiceUrl: window.location.origin,
            environment: "alpha"
        };
        this.config = _.merge(defaults, Config, config);

        // Apply default server URLs based on selected environment
        if (Config.servers[this.config.environment]) {
            this.config = _.merge({
                appServerUrl: Config.servers[this.config.environment].appServerUrl,
                didServerUrl: Config.servers[this.config.environment].didServerUrl,
            }, this.config);
        }
        
        this.user = new VeridaUser(chain, address, web3Provider, this.config.didServerUrl);
        this.outbox = new Outbox(this);
        this.inbox = new Inbox(this);

        this.dataserver = new DataServer(this, {
            datastores: this.config.datastores,
            serverUrl: this.config.appServerUrl,
            didUrl: this.config.didServerUrl
        });

        this._schemas = {};
        this._isConnected = false;
        this._dataservers = {};
    }

    /**
     * Connect a user to the application. Similar to "logging in" to an application. 
     * This will popup a metamask window asking the user to authorize the application.
     * 
     * The user will remain logged in for all subsequent page loads until `app.logout()` is called.
     */
    async connect(force) {
        if (this._isConnected && force) {
            throw "Application datastore is already connected";
        }

        let connected = await this.dataserver.connect(force);
        this._isConnected = connected;
        if (this._isConnected) {
            await this.inbox.init();
        }

        return connected;
    }

    /**
     * Logout a user.
     */
    disconnect() {
        this.dataserver.logout();
        this._isConnected = false;
    }

    async isConnected() {
        return await this.connect();
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
        return this.dataserver.openDatastore(schemaName, this.user.did, config);
    }

    async openDatabase(dbName, did, config) {
        return this.dataserver.openDatabase(dbName, did, config);
    }

    /**
     * Opens the public profile of any user in read only mode
     * 
     * @param {*} did
     * @example
     * let profile = app.openProfile(userDid);
     * console.log(profile.get("email"));
     * @returns {DataStore} Datastore instance for the requested user profile
     */
    async openProfile(did) {
        did = did.toLowerCase();
        let dataserver = await this.buildDataserver(did, {
            appName: Config.vaultAppName
        });
        let dataStore = await dataserver.openDatastore("profile/public", did, {
            permissions: {
                read: "public",
                write: "owner"
            },
            readOnly: true
        });

        return new Profile(dataStore);
    }

    /**
     * Get a JSON Schema object by name
     * 
     * @param {string} schemaName That may be a name (ie: "social/contact") or a URL of a schema (ie: "https://test.com/schema.json")
     * @returns {Schema}
     */
    async getSchema(schemaName, returnSpec) {
        if (!this._schemas[schemaName]) {
            this._schemas[schemaName] = new VeridaSchema(schemaName, this.config.schemas);
        }

        if (returnSpec) {
            return this._schemas[schemaName].getSpecification();
        }
        return this._schemas[schemaName];
    }

    /**
     * Build a dataserver connection to an external dataserver
     * 
     * @param {*} did 
     * @param {*} config 
     */
    async buildDataserver(did, config) {
        config = _.merge({
            appName: this.name
        }, config);
        did = did.toLowerCase();

        if (this._dataservers[did + ':' + config.appName]) {
            return this._dataservers[did + ':' + config.appName];
        }

        // Get user's VID to obtain their dataserver address
        let vidDoc = await VidHelper.getByDid(did, config.appName, this.config.didServerUrl);

        if (!vidDoc) {
            throw "Unable to locate application VID. User hasn't initialised this application? ("+did+" / "+config.appName+")";
        }

        let dataserverDoc = vidDoc.service.find(entry => entry.id.includes('dataserver'));
        let dataserverUrl = dataserverDoc.serviceEndpoint;

        // Build dataserver config, merging defaults and user defined config
        config = _.merge({
            isProfile: false,
            serverUrl: dataserverUrl,
            didUrl: this.config.didServerUrl
        }, config);

        // Build dataserver
        let dataserver = new DataServer(this, config);
        let keyring = await this.dataserver.getKeyring();
        dataserver.loadExternal({
            vid: vidDoc.id,
            keyring: keyring
        });

        // Cache and return dataserver
        this._dataservers[did + ':' + config.appName] = dataserver;
        return this._dataservers[did + ':' + config.appName];
    }

    async getDidFromVid(vid) {
        return VidHelper.getDidFromVid(vid, this.config.didServerUrl);
    }

}

App.WalletHelper = WalletHelper;
export default App;