import $RefParser from "json-schema-ref-parser";
import Ajv from "ajv";
const resolveAllOf = require('json-schema-resolve-allof');
import App from './app';

// Force schema paths to be applied to URLs
const resolvePath = function(uri) {
    const resolvePaths = App.config.server.schemaPaths;

    for (let searchPath in resolvePaths) {
        let resolvePath = resolvePaths[searchPath];
        if (uri.substring(0, searchPath.length) == searchPath) {
            uri = uri.replace(searchPath, resolvePath);
        }
    }

    return uri;
}

// Used by AJV for resolving URL refs
const loadSchema = async function(uri) {
    uri = resolvePath(uri);
    let request = await fetch(uri);

    // @todo: check valid uri
    let json = await request.json();
    return json;
}

const ajv = new Ajv({loadSchema: loadSchema});

// Add support for JSON Schema draft 06
// @todo make the list of supported drafts customisable
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

// Custom resolver for RefParser
//const { ono } = require("ono");
const resolver = {
    order: 1,
    canRead: true,
    async read(file) {
        return loadSchema(file.url);
        /*try {
            let response = await fetch(file.url);
            return response.json();
        } catch (error) {
            return ono(error, `Error downloading ${file.url}`)
        }*/
    }
};

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
    constructor(path) {
        this.path = path;
        this.errors = [];

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
            this._validate = await ajv.compileAsync(schemaJson);
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
        let fileData = await fetch(path);
        this._schemaJson = await fileData.json();
        return this._schemaJson;
    }

    async getIcon() {
        let path = await this.getPath();
        return path.replace("schema.json","icon.svg");
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
            this._finalPath = resolvePath(path);
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

        this._finalPath = resolvePath(path);
        this.path = this._finalPath;
        return this._finalPath;
    }

}

export default Schema;