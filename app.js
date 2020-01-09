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
        this._dataservers = {
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
        await this._dataservers.app.connect();
        await this._dataservers.user.connect();
    }

    openDatastore(name) {
        return this._dataservers.app.openDatastore(name);
    }

    async getSchema(schemaName) {
        if (!this._schemas[schemaName]) {
            this._schemas[schemaName] = new VeridaSchema(schemaName, this.config.schemas);
        }

        return this._schemas[schemaName];
    }

}

export default App;