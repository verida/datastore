import $RefParser from "json-schema-ref-parser";
import Ajv from "ajv";
const resolveAllOf = require('json-schema-resolve-allof');
import App from './app';
import _ from 'lodash';
import axios from 'axios'

const draft6 = require('ajv/lib/refs/json-schema-draft-06.json');

// Custom resolver for RefParser
//const { ono } = require("ono");
const resolver = {
    order: 1,
    canRead: true,
    async read(file) {
        return Schema.loadJson(file.url);
    }
};

const jsonCache = {};

class Schema {

    /**
     * An object representation of a JSON Schema.
     * 
     * **Do not instantiate directly.**
     * 
     * Access via {@link App#getSchema}
     * @param {object} path Path to a schema in the form (http://..../schema.json, /schemas/name/schema.json, name/of/schema)
     * @constructor
     */
    constructor(path, options) {
        this.path = path;
        this.errors = [];

        options = _.merge({
            metaSchemas: [
                draft6
            ],
            ajv: {
                loadSchema: Schema.loadJson,
                logger: false
            }
        }, options);

        this.ajv = new Ajv(options.ajv);

        for (let s in options.metaSchemas) {
            this.ajv.addMetaSchema(options.metaSchemas[s]);
        }

        this._schemaJson = null;
        this._finalPath = null;
        this._specification = null;
        this._validate = null;
    }

    /**
     * @todo: Deprecate in favour of `getProperties()`
     * Get an object that represents the JSON Schema. Fully resolved.
     * Warning: This can cause issues with very large schemas.
     * 
     * @example
     * let schemaDoc = await app.getSchema("social/contact");
     * let spec = schemaDoc.getSpecification();
     * console.log(spec);
     * @returns {object} JSON object representing the defereferenced schema
     */
    async getSpecification() {
        if (this._specification) {
            return this._specification;
        }

        let path = await this.getPath();
        this._specification = await $RefParser.dereference(path, {
            resolve: { http: resolver }
        });

        await resolveAllOf(this._specification);
        return this._specification;
    }

    /**
     * Validate a data object with this schema, using AJV
     * 
     * @param {object} data 
     * @returns {boolean} True if the data validates against the schema.
     */
    async validate(data) {
        if (!this._validate) {
            let schemaJson = await this.getSchemaJson();
            this._validate = await this.ajv.compileAsync(schemaJson);
        }

        let valid = await this._validate(data);
        if (!valid) {
            this.errors = this._validate.errors;
        }
        
        return valid;
    }

    /**
     * Fetch unresolved JSON schema
     */
    async getSchemaJson() {
        if (this._schemaJson) {
            return this._schemaJson;
        }

        let path = await this.getPath();
        let fileData = await axios.get(path, {
            responseType: 'json'
        });
        this._schemaJson = await fileData.data;
        return this._schemaJson;
    }

    async getAppearance() {
        const schemaJson = await this.getSpecification()
        let appearance = schemaJson.appearance
        if (appearance.style && appearance.style.icon) {
            let icon = schemaJson.appearance.style.icon
            if (icon.substring(0,2) == './') {
                // support relative icon path
                const path = await this.getPath();
                icon = path.replace("schema.json",icon.substring(2));
            }
            if (icon.substring(0,1) == '/') {
                // support absolute icon path
                const path = await this.getPath();
                const rootPathParts = path.match(/^(https?:\/\/[^\/]*)/)
                icon = rootPathParts[0] + '/' + icon.substring(1);
            }

            schemaJson.appearance.style.icon = icon
        }
        
        return appearance
    }

    /**
     * Get a rully resolveable path for a URL
     * 
     * Handle shortened paths:
     *  - `health/activity` -> `https://schemas.verida.io/health/activity/schema.json`
     *  - `https://schemas.verida.io/health/activity` -> `https://schemas.verida.io/health/activity/schema.json`
     *  - `/health/activity/test.json` -> `https://schemas.verida.io/health/activity/test.json`
     */
    async getPath() {
        if (this._finalPath) {
            return this._finalPath;
        }

        let path = this.path;

        // If we have a full HTTP path, simply return it
        if (path.match("http")) {
            this._finalPath = Schema.resolvePath(path);
            return this._finalPath;
        }

        // Prepend `/` if required (ie: "profile/public")
        if (path.substring(1) != '/') {
            path = '/' + path;
        }

        // Append /schema.json if required
        if (path.substring(path.length-5) != ".json") {
            path += "/schema.json";
        }

        this._finalPath = await Schema.resolvePath(path);
        this.path = this._finalPath;
        return this._finalPath;
    }

    /**
     * Force schema paths to be applied to URLs
     * 
     */
    static async resolvePath(uri) {
        const resolvePaths = App.config.server.schemaPaths;

        for (let searchPath in resolvePaths) {
            let resolvePath = resolvePaths[searchPath];
            if (uri.substring(0, searchPath.length) == searchPath) {
                uri = uri.replace(searchPath, resolvePath);
            }
        }

        return uri;
    }

    /**
     * Load JSON from a url that is fully resolved.
     * 
     * Used by AJV.
     * 
     * @param {*} uri 
     */
    static async loadJson(uri) {
        if (jsonCache[uri]) {
          return jsonCache[uri];
        }
    
        jsonCache[uri] = new Promise(async (resolve, reject) => {
          uri = await Schema.resolvePath(uri);
          let request = await axios.get(uri, {
            responseType: 'json'
          }); // @todo: check valid uri
    
          let json = await request.data;
          resolve(json)
        });
    
        return jsonCache[uri]
      }

}

export default Schema;