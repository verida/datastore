/*eslint no-console: "off"*/

import Config from './config';
import WebUser from "./user/web";
import ServerUser from "./user/server";
import VeridaSchema from "./schema";
import DataServer from './dataserver';
import Inbox from "./messaging/inbox";
import Outbox from "./messaging/outbox";
import WalletHelper from "./helpers/wallet";
import VidHelper from "./helpers/vid";
import TrustHelper from './helpers/trust';
import CredentialsHelper from './helpers/credentials';
import Profile from './profile';
import DbManager from './managers/dbManager';

const _ = require('lodash');

/**
 * @property {Wallet} wallet The current user's wallet.
 */
class App {
    /**
     * Create a new application.
     *
     * @constructor
     * @example
     * import VeridaApp from 'verida-datastore';
     * let myApp = new VeridaApp("My Application Name");
     * myApp.connect(true);
     */
    constructor(config) {
        if (process.browser) {
            this.user = new WebUser(config.chain, config.address, config.appServerUrl || App.config.server.appServerUrl, config.web3Provider);
        } else {
            this.user = new ServerUser(config.chain, config.address, config.appServerUrl || App.config.server.appServerUrl, config.privateKey);
        }

        this.outbox = new Outbox(this);
        this.inbox = new Inbox(this);
        this.dbManager = new DbManager(this);

        this.dataserver = new DataServer({
            datastores: config.datastores,
            serverUrl: this.user.serverUrl,
            dbManager: this.dbManager
        });

        this._isConnected = false;
    }

    /**
     * Override the default config
     *
     * @param {*} config
     */
    static setConfig(config) {
        App.config = _.merge({}, App.config, config);
        App.config.server = App.config.servers[App.config.environment];
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

        let connected = await this.dataserver.connect(this.user, force);
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

    /**
     * Determine if the current application instnace is connected
     */
    async isConnected() {
        return await this.connect();
    }

    /**
     * Determine if a web session exists for a given DID (indicates they can be autologgedin)
     *
     * @param {string} did User's DID
     * @param {string} appName Application name
     */
    static async webSessionExists(did, appName) {
        return WebUser.hasSessionKey(did, appName);
    }

    /**
     * Open an application datastore owned by the current suer
     *
     * @param {string} schemaName
     * @param {object} [config] Optional data store configuration
     * @returns {DataStore} Datastore instance for the requested schema
     */
    async openDatastore(schemaName, config) {
        config = _.merge(config, {
            user: this.user
        });

        // TODO: Add schema specific config from app config or do it in openDatastore?
        return this.dataserver.openDatastore(schemaName, config);
    }

    /**
     * Open an application database owned by the current user
     *
     * @param {*} dbName
     * @param {*} config
     */
    async openDatabase(dbName, config) {
        config = _.merge(config, {
            user: this.user
        });

        return this.dataserver.openDatabase(dbName, config);
    }

    /**
     * Open an application datastore owned by an external user
     *
     * @param {*} schemaName
     * @param {*} did
     * @param {*} config
     */
    static async openExternalDatastore(schemaName, did, config) {
        did = did.toLowerCase();
        let dataserver = await App.buildDataserver(did, {
            appName: config.appName || App.config.appName
        });

        config.did = did;
        return dataserver.openDatastore(schemaName, config);
    }

    /**
     * Open an application database owned by an external user
     *
     * @param {*} dbName
     * @param {*} did
     * @param {*} config
     */
    static async openExternalDatabase(dbName, did, config) {
        did = did.toLowerCase();
        let dataserver = await App.buildDataserver(did, {
            appName: config.appName || App.config.appName
        });

        config.did = did;
        return dataserver.openDatabase(dbName, config);
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
    static async openProfile(did, appName) {
        let datastore = await App.openExternalDatastore("profile/public", did, {
            appName: appName || App.config.vaultAppName,
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
    static async getSchema(schemaName, returnSpec) {
        if (!App.cache.schemas[schemaName]) {
            App.cache.schemas[schemaName] = new VeridaSchema(schemaName);
        }

        if (returnSpec) {
            return App.cache.schemas[schemaName].getSpecification();
        }

        return App.cache.schemas[schemaName];
    }

    /**
     * Build a dataserver connection to an external dataserver.
     *
     *
     * @param {*} did
     * @param {*} config
     */
    static async buildDataserver(did, config) {
        did = did.toLowerCase();

        config = _.merge({
            appName: App.config.appName,
            did: did
        }, config);


        if (App.cache.dataservers[did + ':' + config.appName]) {
            return App.cache.dataservers[did + ':' + config.appName];
        }

        // Get user's VID to obtain their dataserver address
        let vidDoc = await VidHelper.getByDid(did, config.appName);

        if (!vidDoc) {
            throw "Unable to locate application VID. User hasn't initialised this application? ("+did+" / "+config.appName+")";
        }

        let dataserverDoc = vidDoc.service.find(entry => entry.id.includes('dataserver'));
        let dataserverUrl = dataserverDoc.serviceEndpoint;

        // Build dataserver config, merging defaults and user defined config
        config = _.merge({
            isProfile: false,
            serverUrl: dataserverUrl,
            dbManager: this.dbManager
        }, config);

        // Build dataserver
        let dataserver = new DataServer(config);
        dataserver.loadExternal({
            vid: vidDoc.id
        });

        // Cache and return dataserver
        App.cache.dataservers[did + ':' + config.appName] = dataserver;
        return App.cache.dataservers[did + ':' + config.appName];
    }

}

App.Helpers = {
    vid: VidHelper,
    wallet: WalletHelper,
    trust: TrustHelper,
    credentials: CredentialsHelper,
    schema: VeridaSchema
};


App.cache = {
    schemas: {},
    dataservers: {}
};

App.config = Config;

export default App;
