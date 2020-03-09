import $RefParser from "json-schema-ref-parser";
import Ajv from "ajv";
const ajv = new Ajv();
const resolveAllOf = require('json-schema-resolve-allof');

class Schema {

    /**
     * An object representation of a JSON Schema.
     * 
     * **Do not instantiate directly.**
     * 
     * Access via {@link App#getSchema}
     * @constructor
     */
    constructor(path, config) {
        this.path = path;
        this.name = null;

        this._config = config;

        this._specification = null;
        this.errors = [];
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
        if (this._specification) {
            return this._specification;
        }

        // Handle a schema being provided as a URL
        if (!this.path.match("http")) {
            let path = this._config.basePath + this.path + '/schema.json';
            try {
                this._specification = await $RefParser.dereference(path);
            } catch (err) {
                // Schema failed, try custom schema location
                path = this._config.customPath + this.path + '/schema.json';
                this._specification = await $RefParser.dereference(path);
            }

            this.path = path;
            
        } else {
            this._specification = await $RefParser.dereference(this.path + '/schema.json');
        }

        let spec = await resolveAllOf(this._specification);
        this.name = spec.name;
        return spec;
    }

    /**
     * Validate a data object with this schema.
     * 
     * @param {object} data 
     * @returns {boolean} True if the data validates against the schema.
     */
    async validate(data) {
        let specification = await this.getSpecification();
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

}

export default Schema;