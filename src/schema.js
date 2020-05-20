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

// Temporary includes for testing hyperjump  property fetching
import jsonSchema from '@hyperjump/json-schema'
import HJSchema from '@hyperjump/json-schema-core'
import Pact from '@hyperjump/pact'

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

        this._name = null;
        this._finalPath = null;
        this._specification = null;
        this._validate = null;

        // @todo remove
        this._ajv = ajv;
        this._refparser = $RefParser;
        this._jsonSchema = jsonSchema;
        this.Schema = HJSchema;
        this.Pact = Pact;
    }

    // @todo: this works on FHIR, but not basic schemas.. :/
    // @todo: not working at all now
    async getProperties() {
        let path = await this.getPath();
        console.log(path);
        let propertySchema = await HJSchema.Schema.get(path + '#/properties');
        console.log(propertySchema);
        const entries = await this.Pact.pipeline([
            HJSchema.Schema.entries,
            this.Pact.map(async (entry) => {
                console.log(entry);
                const [propertyName, propertySchema] = await entry;
                const properties = ['type', 'title', 'description', 'default', 'format', 'enum', 
            'items'];
                let item = {};
                for (var p in properties) {
                    let prop = properties[p];
                    const type = await HJSchema.Schema.step(prop, propertySchema);
                    let value = HJSchema.Schema.value(type);
                    item[prop] = value;
                }

                console.log(propertyName, item);   
                return item;
            }),
            this.Pact.all
          ], propertySchema);

          return entries;
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

        let spec = await resolveAllOf(this._specification);
        //this.name = spec.name;

        return this._specification;
    }

    /**
     * 
     */
    async getName() {
        if (this._name) {
            return this.name;
        }

        let path = await this.getPath();
        let parts = path.split('#');

        if (!parts.length) {
            throw new Error('Unable to determine schema name')
        }

        this.name = parts[0];
        return this.name;
    }

    /**
     * Validate a data object with this schema.
     * 
     * @param {object} data 
     * @returns {boolean} True if the data validates against the schema.
     */
    async validate(data) {
        if (!this._validate) {
            let path = await this.getPath();
            let fileData = await fetch(path);
            let json = await fileData.json();
            this._validate = await ajv.compileAsync(json);
        }

        let valid = await this._validate(data);
        if (!valid) {
            this.errors = this._validate.errors;
        }
        
        return valid;
    }

    async getIcon() {
        let path = await this.getPath();
        return path.replace("schema.json","icon.svg");
    }

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
        return this._finalPath;
    }

}

export default Schema;