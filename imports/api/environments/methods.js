import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import { Random } from 'meteor/random';
import { EJSON } from 'meteor/ejson';
import uuid from 'uuid/v1';

/*
 * Environment methods
*/
Meteor.methods({
  /*
   * Registers a thing.
  */
  'Environment.register': function (auth, config) {
    check(auth, {
      uuid: String,
      token: String
    });
    check(config, Object);

    // Check to see we have that thing and fetch the document.
    let thing = Environments.findOne(auth, {
      fields: {
        _id: 1
      }
    });

    if (!thing) {
      // If we don't have a thing register we insert a new one.
      // Note this devices does not have an owner yet.
      config = _.extend(config, { registeredAt: new Date() });

      if (!Environments.insert(config)) { throw new Meteor.Error('internal-error', "Internal error."); }
    }

    else {
      config = _.extend(config, { registeredAt: new Date() });

      // Update the document
      if (!Environments.update(thing._id, {
        $set: config
      })) { throw new Meteor.Error('internal-error', "Internal error."); }
    }
  },

  /*
   * Creates a new thing with UUID and Token.
  */
  'Environment.new': function (thing, auth) {
    check(thing, Match.OneOf(Object, null));
    check(auth, Match.OneOf({
      uuid: String,
      token: String
    }, undefined));

    // Check to see we have a registered thing and fetch the document.
    let registered = Environments.findOne(auth, {
      fields: {
        _id: 1
      }
    });

    if (!registered) {
      let document;

      // Must be a logged in user.
      if (Meteor.userId()) {
        if (auth) {
          document = {
            'uuid': auth.uuid,
            'token': auth.token,
            'owner': Meteor.userId(),
            thing,
          };
        } else {
          document = {
            'uuid': uuid(),
            'token': Random.id(32),
            'owner': Meteor.userId(),
            thing,
          };
        }
        if (!Environments.insert(document)) { throw new Meteor.Error('internal-error', "Internal error."); }

        return document;
      }
    } else {
      // Must be a logged in user.
      if (Meteor.userId()) {
        document = {
          'owner': Meteor.userId(),
        };
        // Update the document
        if (!Environments.update(registered._id, {
          $set: document
        })) { throw new Meteor.Error('internal-error', "Internal error."); }
      }
    }
  },

  /*
   * Creates a new thing with UUID and Token.
  */
  'Environment.generateAPIKeys': function (thing, auth) {
    check(thing, Match.OneOf(Object, undefined));
    check(auth, Match.OneOf({
      uuid: String,
      token: String
    }, undefined));

    // Must be a logged in user.
    if (Meteor.userId()) {
      let document = {
        'uuid': uuid(),
        'token': Random.id(32),
      };

      return document;
    }
  },

  /*
   * Set property
  */
  'Environment.setProperty': function (auth, key, value) {
    check(auth, {
      uuid: String,
      token: String
    });
    check(key, String);
    check(value, Match.OneOf(String, Number, Object, Boolean));

    let thing = Environments.findOne(auth, {
      fields: {
        _id: 1,
        properties: 1
      }
    });
    if (!thing) { throw new Meteor.Error('unauthorized', "Unauthorized."); }

    thing.properties[key] = value;

    return Environments.update(thing._id, {
      $set: {
        'properties': thing.properties
      }
    });
  },

  /*
   * Delete thing.
  */
  'Environment.delete': function (uuid) {
    check(uuid, String);

    // Users can only delete things they own... someone please audit this...
    let thing = Environments.findOne({
      'uuid': uuid,
      'owner': Meteor.userId()
    });
    if (!thing) { throw new Meteor.Error('unauthorized', "Unauthorized."); }

    return Environments.remove(thing._id);
  },

  /*
   * TODO be able to share a read only view of the device publically.
   */
    'Environment.setAccess': function (uuid, options) {
        check(uuid, String);
        // TODO a more robust check of the options object
        check(options, Object);
        // Users can only delete things they own... someone please audit this...
        let thing = Environments.findOne({
            'uuid': uuid,
            'owner': Meteor.userId()
        });
        if (!thing) { throw new Meteor.Error('unauthorized', "Unauthorized."); }

        return Environments.update(thing._id, {
            $set: {
                publicReadonly: options.publicReadonly
            }
        });
    }
});


function getEnvironmentByUUID (uuid) {
    check(uuid, String);
    // Users can only delete things they own... someone please audit this...
    let thing = Environments.findOne({
        'uuid': uuid,
        'owner': Meteor.userId()
    });

    if (!thing) {
        throw new Meteor.Error('unauthorized', "Unauthorized.")
    } else {
        return thing
    };
}