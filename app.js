/*eslint no-console: "off"*/
"use strict"

import Config from './config';

import VeridaUser from "./user";
import VeridaSchema from "./schema";
import Client from "./client";
import Wallet from './wallet';
import Profile from './profile';
import Datastore from './datastore';

const _ = require('lodash');

class App {

    constructor(name, config) {
        this.name = name;
        this.config = {};
        _.merge(this.config, Config, config);
        
        this.client = new Client(this);
        this.wallet = new Wallet(this);
        this.profile = new Profile(this);

        this.user = null;
        this.errors = null;

        this._datastores = {};
        this._schemas = {};
    }

    /**
     * Set the credentials for this user
     * 
     * @param {*} username 
     * @param {*} password 
     */
    setCredentials(username, password) {
        this.client.username = username;
        this.client.password = password;
    }

    /**
     * Look for web3 to connect user
     */
    async connectUser() {
        if (this.user) {
            throw "User already exists, disconnect first";
        }

        this.user = new VeridaUser(this);
        await this.user.connect();
    }

    openDatastore(name) {
        if (this._datastores[name]) {
            return this._datastores[name];
        }

        this._datastores[name] = new Datastore(this, name);

        return this._datastores[name];
    }

    async getSchema(schemaName) {
        if (!this._schemas[schemaName]) {
            this._schemas[schemaName] = new VeridaSchema(schemaName, this.config.schemas);
        }

        return this._schemas[schemaName];
    }

    getDataStoreConfig(schemaName, extraConfig) {
        let config = {};
        extraConfig = extraConfig ? extraConfig : {};
        _.merge(config, this.config.datastores.default, extraConfig);

        if (typeof(this.config.datastores[schemaName]) !== 'undefined') {
            _.merge(config, this.config.datastores[schemaName]);
        }

        return config;
    }

}

export default App;