/*eslint no-console: "off"*/

import '../shim';
import Config from './config';
import ServerUser from "./user/server";
import VeridaSchema from "./schema";
import DataServer from './dataserver';
import Inbox from "./messaging/inbox";
import Outbox from "./messaging/outbox";
import WalletHelper from "./helpers/wallet";
import VidHelper from "./helpers/vid";
import TrustHelper from './helpers/trust';
import CredentialsHelper from './helpers/credentials';
import StaticHelper from './helpers/static';
import Encryption from '@verida/encryption-utils';
import DbManager from './managers/dbManager';
import ProfileManager from './managers/profileManager';

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
        this.user = new ServerUser(config.chain, config.address, config.appServerUrl || App.config.server.appServerUrl, config.privateKey);

        this.outbox = new Outbox(this);
        this.inbox = new Inbox(this);
        this.dbManager = new DbManager(this);
        this.profileManager = new ProfileManager(this);

        this.dataserver = new DataServer({
            datastores: config.datastores,
            serverUrl: this.user.serverUrl,
            dbManager: this.dbManager
        });

        this._isConnected = false;

        this.Helpers = {
            vid: VidHelper,
            wallet: WalletHelper,
            trust: TrustHelper,
            credentials: CredentialsHelper,
            schema: VeridaSchema,
            encryption: Encryption
        };

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
     * @todo Deprecate and move into a helper
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

    async openExternalDatastore(schemaName, did, config) {
        return StaticHelper.openExternalDatastore(schemaName, did, config)
    }

    async openExternalDatabase(dbName, did, config) {
        return StaticHelper.openExternalDatabase(dbName, did, config)
    }

    async openProfile(did, appName) {
        return StaticHelper.openProfile(did, appName)
    }

    async getSchema(schemaName, returnSpec) {
        return StaticHelper.getSchema(schemaName, returnSpec)
    }

    async buildDataserver(did, config) {
        return StaticHelper.buildDataserver(did, config)
    }

}

App.Helpers = {
    vid: VidHelper,
    wallet: WalletHelper,
    trust: TrustHelper,
    credentials: CredentialsHelper,
    schema: VeridaSchema,
    encryption: Encryption
};

App.cache = {
    schemas: {},
    dataservers: {}
};

App.openExternalDatastore = StaticHelper.openExternalDatastore;
App.openExternalDatabase = StaticHelper.openExternalDatabase;
App.openProfile = StaticHelper.openProfile;
App.getSchema = StaticHelper.getSchema;
App.buildDataserver = StaticHelper.buildDataserver;

App.config = Config;

App.setConfig = function(config) {
    App.config = _.merge({}, App.config, config);
    App.config.server = App.config.servers[App.config.environment];
}

export default App;
