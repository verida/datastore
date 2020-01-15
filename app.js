/*eslint no-console: "off"*/
"use strict"

import Config from './config';

import VeridaUser from "./user";
import VeridaSchema from "./schema";
import Wallet from './wallet';
import DataServer from './dataserver';

const _ = require('lodash');

class App {

    /**
     * Create a new application
     * 
     * @param {String} name Name of the application
     * @param {Object} config Configuration for the application
     * @constructor
     * @example 
     * import VeridaApp from 'verida-datastore';
     * let myApp = new VeridaApp("My Application Name");
     */
    constructor(name, config) {
        this.name = name;
        this.config = {};
        _.merge(this.config, Config, config);
        
        this.user = null;


        this.wallet = new Wallet(this);
        this.errors = null;

        this._schemas = {};
        this.dataservers = {
            // Connection to application's data server
            app: new DataServer(this, {
                datastores: this.config.datastores,
                serverUrl: this.config.appServerUrl,
                dbHashKey: this.config.dbHashKey,
            }),
            // Connection to the user's data server
            user: new DataServer(this, {
                appName: "Verida Wallet",
                serverUrl: this.config.userServerUrl
            }),
        };
    }

    /**
     * Look for web3 to connect user
     */
    async connect() {
        if (this.user) {
            throw "User already exists, disconnect first";
        }

        this.user = new VeridaUser(this);
        await this.user.init();
        await this.dataservers.app.connect();
    }

    logout() {
        this.dataservers.app.logout();
        this.dataservers.user.logout();
    }

    /**
     * Open an application datastore.
     * 
     * @param {*} name 
     * @param {*} config 
     */
    async openDatastore(name, config) {
        // TODO: Add schema specific config from app config or do it in openDatastore?
        return this.dataservers.app.openDatastore(name, this.user.did, config);
    }

    /**
     * Opens the profile of another user in read only mode
     * 
     * @param {*} did 
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

    async getSchema(schemaName) {
        if (!this._schemas[schemaName]) {
            this._schemas[schemaName] = new VeridaSchema(schemaName, this.config.schemas);
        }

        return this._schemas[schemaName];
    }

}

export default App;