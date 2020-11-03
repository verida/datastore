import App from '../app'
import Profile from '../profile';
import VeridaSchema from "../schema";
import VidHelper from "./vid";
import DataServer from '../dataserver';
const _ = require('lodash');

export default class StaticHelper {

    /**
     * Open an application datastore owned by an external user
     *
     * @param {string} schemaName
     * @param {string} did
     * @param {object} config
     * @return {object} Datastore instance
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
     * @param {string} dbName
     * @param {string} did
     * @param {object} config
     * @return {object} Database instance
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
     * @param {string} did
     * @example
     * let profile = app.openProfile(userDid);
     * console.log(profile.get("email"));
     * @return {DataStore} Datastore instance for the requested user profile
     */
    static async openProfile(did, appName) {
        const datastore = await App.openExternalDatastore("profile/public", did, {
            appName: appName || App.config.vaultAppName,
            permissions: {
                read: "public",
                write: "owner"
            },
            readOnly: true
        });

        return new Profile(datastore);
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
            serverUrl: dataserverUrl
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