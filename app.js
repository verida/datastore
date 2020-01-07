/*eslint no-console: "off"*/
"use strict"

import Config from './config';

import PrivateDataStore from "./datastores/private";
import PublicDataStore from "./datastores/public";
import VeridaUser from "./user";
import VeridaSchema from "./schema";
import Client from "./client";

const _ = require('lodash');

class App {

    constructor(name, config) {
        this.name = name;
        this.config = {};
        _.merge(this.config, Config);

        let defaultConfig = {
            datastores: {
                default: {
                    privacy: "private"
                }
            },
            schemas: {
                basePath: '/schemas/',
                customPath: '/customSchemas/'
            }
        };

        _.merge(this.config, defaultConfig, config);

        // TODO: verify the app

        // instance of VeridaUser
        this._user = null;

        this._datastores = {};
        this._schemas = {};
        this.client = new Client(this);

        this.errors = null;
    }

    setCredentials(username, password) {
        this.client.username = username;
        this.client.password = password;
    }

    /**
     * Look for web3 to connect user
     */
    async connectUser() {
        if (this._user) {
            throw "User already exists, disconnect first";
        }

        this._user = new VeridaUser(this);
        await this._user.connect(this.name);
    }

    async save(schemaName, data, options) {
        let schema = await this.getSchema(schemaName);
        let valid = await schema.validate(data);
        if (!valid) {
            this.errors = schema.errors;
            return false;
        }

        let dataStore = await this.getDataStore(schemaName);

        data.schema = schemaName;
        return dataStore.save(data, options);
    }

    async getMany(schemaName, customFilter, options) {
        let filter = {};
        _.merge(filter, {
            schema: schemaName
        }, customFilter);

        let dataStore = await this.getDataStore(schemaName);
        return dataStore.getMany(filter, options);
    }

    async delete(schemaName, docId) {
        let dataStore = await this.getDataStore(schemaName);
        return dataStore.delete(docId);
    }

    async getSchema(schemaName) {
        if (!this._schemas[schemaName]) {
            this._schemas[schemaName] = new VeridaSchema(schemaName, this.config.schemas);
        }

        return this._schemas[schemaName];
    }

    async getDataStore(schemaName) {
        let schema = await this.getSchema(schemaName);
        let specification = await schema.getSpecification();
        let databaseName = specification.database.name;
        let dataStoreConfig = this._getDataStoreConfig(schemaName);
        let dataStore = await this._getDataStore(databaseName, dataStoreConfig);
        return dataStore;
    }

    /**
     * Get a datastore by name. Creates a new datastore if it doesn't exist.
     * options.privacy = public,private,restricted
     */
    async _getDataStore(name, dataStoreConfig) {
        if (this._datastores[name]) {
            return this._datastores[name];
        }

        if (!this._user) {
            throw "User not connected";
        }

        let dataStore = null;

        switch (dataStoreConfig.privacy) {
            case "private":
                dataStore = new PrivateDataStore(name, this._user, this);
                break;
            case "public":
                dataStore = new PublicDataStore(name, this._user, this);
                break;
        }

        this._datastores[name] = dataStore;

        return this._datastores[name];
    }

    _getDataStoreConfig(schemaName) {
        let config = {};
        _.merge(config, this.config.datastores.default);

        if (typeof(this.config.datastores[schemaName]) !== 'undefined') {
            _.merge(config, this.config.datastores[schemaName]);
        }

        return config;
    }

}

export default App;