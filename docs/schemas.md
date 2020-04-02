
# Schemas

`Verida Datastore` schemas are defined as valid [JSON Schema](https://json-schema.org/) files.

At the very least, each schema defines:

- Schema name
- List of valid fields
- List of required fields
- Default database name
- Default database indexes

## Types of Schemas

### Core schemas

Verida defines many core schemas that are used by the `Verida Vault` for storing important personal data. This includes some internal schemas used for inbox messaging.

These schemas can all be found in the [Verida Schemas](https://github.com/verida/schemas) git repo.

### Application schemas

Applications are free to create their own schemas for use within their application. Schemas should be valid JSON schema files and be hosted by your application. By convention, `Verida Datastore` searches for custom schemas in the `/customSchemas/` path of your application.

### Industry schemas

Anyone can create a schema and use it, including industry bodies. In the future, it's aimed that pro-active industry associations will help shape data standards for use across many industries. This will help individuals retain data portability.

## Non-Schema Data

The schema framework is flexible enough to support applications storing data that doesn't fit within the schema. This can be useful if you want to use a public schema, but have additional data that isn't stored in the current schema.

In that instance, the extra data can be stored in the `extras` object that exists in every schema definition.

## Validation

Data is validated against the schema before every save.

## Base Schema

All schemas inherit from a base schema (`/schemas/base/schema.json`). This provides a consistent set of common fields such as:

- `name` - Unique per record
- `insertedAt` - Timestamp the record was inserted
- `modifiedAt` - Timestamp the record was modified
- `schema` - Name of the schema this record adheres to (used for validation)
- ... and many more

## Example Schema

There is a **very** basic `social/contact` schema provided in the core schemas:

```
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "schemas/social/contact/schema.json",
    "title": "Contact",
    "titlePlural": "Contacts",
    "description": "A record of a contact",
    "type": "object",
    "database": {
        "name": "contact",
        "indexes": {
            "email": ["email"],
            "did": ["did"],
            "name": ["lastName", "firstName"]
        }
    },
    "allOf": [
        {"$ref": "/schemas/base/schema.json"},
        {
            "properties": {
                "firstName": {
                    "title": "First Name",
                    "type": "string"
                },
                "lastName": {
                    "title": "Last Name",
                    "type": "string"
                },
                "email": {
                    "title": "Email",
                    "type": "string",
                    "format": "email"
                },
                "mobile": {
                    "title": "Mobile",
                    "type": "string"
                },
                "did": {
                    "title": "DID",
                    "type": "string"
                }
            },
            "required": ["firstName", "lastName"]
        }
    ]
  }
}
```

### allOf

Note the use of `allOf`. That is a native JSON Schema property that combines the base schema (`/schemas/base/schema.json`) with the properties unique for this schema. All custom schemas must include this, to ensure the base schema properties are included in the custom schema.

## Creating Schemas

You can create your own schemas in a `schema.json` file and publish it to your website.

Here's an example custom schema for a note:

```
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "/general/note/schema.json",
    "name": "general/note",
    "title": "Note",
    "description": "A simple text note",
    "type": "object",
    "database": {
        "name": "general_note",
        "indexes": {
            "insertedAt": ["insertedAt"]
        }
    },
    "allOf": [
        {"$ref": "https://schemas.testnet.verida.io/core/base/schema.json"},
        {
            "properties": {
                "title": {
                    "title": "Title",
                    "description": "Title for the note"
                    "type": "string"
                },
                "body": {
                    "title": "Body",
                    "description": "Main body content for the note",
                    "type": "string"
                },
                "tags": {
                    "title": "Tags",
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            },
            "required": ["title", "body"]
        }
    ]
  }
```

By default, the Verida Datastore looks in `/schemas/custom/` for any custom schemas. In this case, make the file available at `http://<your host>/schemas/custom/general/note/schema.json`.

You can then open a new datastore using this schema with:

```
let datastore = app.openDatastore('general/note')
```

## Versioning

Schemas do not currently support versioning. We are looking to address this in the near future.

## Migration

Schemas do not currently support migration. We are investigating ways to build an agile migration strategy into the architecture to help improve the process of defining data standards.