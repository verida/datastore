import { utils } from 'ethers';
const _ = require('lodash');

class DbManager {

    constructor(app) {
        this._app = app;

        this._dbStore = null;
    }

    async saveDb(dbName, did, appName, permissions, encryptionKey, options) {
        await this.init();

        options = _.merge({
            key: {
                type: "secp256k1"
            }
        }, options);

        let id = this.buildDbId(dbName, did, appName);

        let dbData = {
            _id: id,
            dbName: dbName,
            did: did,
            applicationName: appName,
            permissions: permissions,
            encryptionKey: {
                key: encryptionKey,
                type: options.key.type
            }
        };

        let doc = await this._dbStore.getOne({
            _id: id
        });

        if (!doc) {
            let saved = await this._dbStore.save(dbData, {
                forceInsert: true
            });

            if (!saved) {
                console.error(this._dbStore.errors);
            }
        }
    }

    async getMany(filter, options) {
        await this.init();

        return this._dbStore.getMany(filter, options);
    }

    async get(dbName, did, appName) {
        await this.init();

        let dbId = this.buildDbId(dbName, did, appName);
        return this._dbStore.getOne(dbId);
    }

    /*
    @todo: Support updating permissions on a user database
    async updatePermissions(dbName, config) {
        // will need dataserver connection
    }*/

    buildDbId(dbName, did, appName) {
        return utils.hashMessage(dbName + '_' + did + '_' + appName);
    }

    async init() {
        if (this._dbStore) {
            return;
        }
        
        this._dbStore = await this._app.openDatastore('storage/database', {
            saveDatabase: false
        });
    }

}

export default DbManager;