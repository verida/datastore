import _ from 'lodash';

class SyncManager {

    constructor(app, user) {
        this._app = app;
        this._user = user;
    }

    async init() {
        // 
    }

    /**
     * Create a new sync request
     */
    async new(externalDbName, externalDid, externalApplicationName, externalKey, destinationDbName, schemas, options) {
        options = _.merge(options, {
            keyType: '',
            filter: {},
            syncType: 'pull',
            frequency: 60
        });

        let sync = {
            externalDbName: externalDbName,
            externalDid: externalDid,
            externalApplicationName: externalApplicationName,
            externalKey: externalKey,
            externalKeyType: options.keyType,
            destinationDbName: destinationDbName,
            schemas: schemas,
            filter: options.filter,
            syncType: options.syncType,
            frequency: options.frequency
        }

        // @todo catch errors
        let syncDb = this._app.openDatstore("storage/sync");
        syncDb.save(sync);
    }

    /**
     * Manually perform a sync with an external database
     */
    async sync(syncId) {

    }

}

export default SyncManager;