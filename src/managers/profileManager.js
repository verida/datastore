/* eslint no-console: "off" */
/**
 * Public profile for a user.
 */
class ProfileManager {
    /**
       * Create a new user profile.
       *
       * **Do not instantiate directly.**
       *
       * Access the current user's profile via {@link App.profile}
       *
       * @constructor
       */
    constructor (app) {
      this._app = app
      this._store = null
    }
  
    /**
       * Get a profile value by key
       *
       * @param {string} key Profile key to get (ie: `email`)
       * @example
       * let emailDoc = app.wallet.profile.get('email');
       *
       * // key = email
       * // value = john@doe.com
       * console.log(emailDoc.key, emailDoc.value);
       * @return {object} Database record for this profile key. Object has keys [`key`, `value`, `_id`, `_rev`].
       */
    async get (key, options, extended) {
      await this.init()
      try {
        let response = await this._store.get(key, options)
        if (!extended) {
          return response.value
        }
  
        return response
      } catch (err) {
        if (err.error === 'not_found') {
          return null
        }
  
        throw err
      }
    }
  
    /**
       *
       * @param {string} key Profile key to delete (ie: `email`)
       * @returns {boolean} Boolean indicating if the delete was successful
       */
    async delete (key) {
      await this.init()
      return this._store.delete(key)
    }
  
    /**
       * Get many profile values.
       *
       * @param {object} [customFilter] Database query filter to restrict the results passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
       * @param {object} [options] Database options that will be passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
       */
    async getMany (filter, options) {
      await this.init()
      return this._store.getMany(filter, options)
    }
  
    /**
       * Set a profile value by key
       *
       * @param {string|object} doc Profile key to set (ie: `email`) **OR** an existing profile document obtained from `get()` or getMany()`.
       * @param {*} value Value to save
       * @example
       * // Set a profile value by key
       * app.wallet.profile.set('name', 'John');
       *
       * // Update a profile value from an existing document
       * let emailDoc = app.wallet.profile.get('email');
       * app.wallet.profile.set(emailDoc, 'john@doe.com');
       *
       * // Update a profile profile by key
       * app.wallet.profile.set('email', 'john@doe.com');
       * @returns {boolean} Boolean indicating if the save was successful
       */
    async set (doc, value) {
      await this.init()
  
      if (typeof doc === 'string') {
        doc = {
          '_id': doc,
          'key': doc
        }
      }
  
      // Try to find the original document and do an update if it exists
      if (doc._rev === undefined) {
        try {
          let oldDoc = await this.get(doc._id, {}, true)
          if (oldDoc) {
            doc = oldDoc
          }
        } catch (err) {
          // not found, so let the insert continue
        }
      }
  
      doc.value = value
      return this._store.save(doc)
    }
  
    async init () {
      if (this._store) {
        return
      }
  
      this._store = await this._app.openDatastore('https://schemas.verida.io/profile/public/schema.json', {
        permissions: {
          read: 'public',
          write: 'owner'
        }
      })
  
      // Force fetching something to ensure the database gets loaded.
      // This ensures a new user always has a public profile database
      // created so other applications can query it.
      try {
        await this.get('')
      } catch (err) {
        // May be not found, which is fine
      }
    }
  
    async getDatastore () {
      await this.init()
      return this._store
    }
  }
  
  export default ProfileManager
  