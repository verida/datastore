import $RefParser from "json-schema-ref-parser";
import Ajv from "ajv";
let ajv = new Ajv();

window.Ajv = Ajv;

class Schema {

    /**
     * An object representation of a JSON Schema.
     * 
     * **Do not instantiate directly.**
     * 
     * Access via {@link App#getSchema}
     * 
     * @constructor
     */
    constructor(name, config) {
        this.name = name;

        this._config = config;
        this._initialised = false;

        this._specification = null;
        this.errors = [];
    }

    async init() {
        if (!this._initialised) {
            
            this._initialised = true;
        }
    }

    async getSpecification() {
        if (!this._specification) {
            try {
                this._specification = await $RefParser.dereference(this._config.basePath + this.name + '/schema.json');
            } catch (err) {
                // Schema failed, try custom schema location
                this._specification = await $RefParser.dereference(this._config.customPath + this.name + '/schema.json');
            }
        }

        return this._specification;
    }

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