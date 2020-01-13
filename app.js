/*eslint no-console: "off"*/
"use strict"

import Config from './config';

import VeridaUser from "./user";
import VeridaSchema from "./schema";
import Wallet from './wallet';
import DataServer from './dataserver';

const _ = require('lodash');

class App {

    constructor(name, config) {
        this.name = name;
        this.config = {};
        _.merge(this.config, Config, config);
        
        this.user = null;
        this.wallet = new Wallet(this);
        this.errors = null;

        this._schemas = {};
        this.dataservers = {
            app: new DataServer(this, {
                datastores: this.config.datastores,
                serverUrl: this.config.appServerUrl,
                appHost: this.config.appHost,
                isUser: false
            }),
            user: new DataServer(this, {
                serverUrl: this.config.userServerUrl,
                dsn: this.config.walletDsn,
                isUser: true
            }),
        };
    }

    /**
     * Look for web3 to connect user
     */
    async connectUser() {
        if (this.user) {
            throw "User already exists, disconnect first";
        }

        this.user = new VeridaUser(this);

        await this.dataservers.app.connect();

        // TODO: Only call `connect` on user when "set()" is called
        await this.dataservers.user.connect();
    }

    openDatastore(name, config) {
        // TODO: Add schema specific config from app config or do it in openDatastore?

        return this.dataservers.user.openDatastore(name, this.user.did, this.name, config);
    }

    /**
     * Opens the profile of another user in read only mode
     * 
     * @param {*} did 
     */
    async openProfile(did) {
        // TODO: Create smart contract that maps DID's to dataservers and
        // dynamically build a dataserver specific for the requested user

        return this.dataservers.user.openDatastore("profile", did, "Verida Wallet", {
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