import $RefParser from "json-schema-ref-parser";
import Ajv from "ajv";
const ajv = new Ajv();
const resolveAllOf = require('json-schema-resolve-allof');
const util = require('util');
const urlExists = util.promisify(require('url-exists'));
const fs = require("fs");
const path = require('path');
const fileExists = async filePath => !!(await fs.promises.stat(filePath).catch(e => false));

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
    constructor(path, config) {
        this._config = config;
        this.path = path;
        this.errors = [];

        this.name = null;
        this._specification = null;
    }

    async init() {
        if (this._specification) {
            return;
        }

        this.path = await this._resolvePath(this.path);
        this._specification = await $RefParser.dereference(this.path);
        let spec = await resolveAllOf(this._specification);
        this.name = spec.name;

        this._init = true;
    }

    /**
     * Get an object that represents the JSON Schema.
     * 
     * @example
     * let schemaDoc = await app.getSchema("social/contact");
     * let spec = schemaDoc.getSpecification();
     * console.log(spec);
     * @returns {object} JSON object representing the defereferenced schema
     */
    async getSpecification() {
        await this.init();
        return this._specification;
    }

    /**
     * Validate a data object with this schema.
     * 
     * @param {object} data 
     * @returns {boolean} True if the data validates against the schema.
     */
    async validate(data) {
        await this.init();
        let specification = this._specification;
        let schema = ajv.getSchema(specification['$id']);
        if (!schema) {
            ajv.addSchema(specification);
        }

        var valid = ajv.validate(specification['$id'], data);
        if (!valid) {
            this.errors = ajv.errors;
            return false;
        }

        return true;
    }

    async getIcon() {
        await this.init();
        return this.path.replace("schema.json","icon.svg");
    }

    async _resolvePath(path) {
        // If we have a full HTTP path, simply return it
        if (path.match("http")) {
            return path;
        }

        // Append /schema.json if required
        if (path.substring(path.length-5) != ".json") {
            path += "/schema.json";
        }

        // Try to resolve the path as being "custom"
        let tmpPath = this._config.customPath + path;
        let exists = await urlExists(tmpPath);
        if (exists) {
            return tmpPath;
        }

        // Try to resolve the path as being "base"
        tmpPath = this._config.basePath + path;
        exists = await urlExists(tmpPath);
        if (exists) {
            return tmpPath;
        }

        throw new Error("Unable to resolve the path for: "+path);
    }

}

export default Schema;