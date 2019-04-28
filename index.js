const mongoose = require('mongoose');

function isBoolean(val) {
  return val === true || val === false;
}

function getPopulateHandler (populatePaths) {
  return function populateHandler (next) {
    if ( // Not apply if query is a population query
      (this._mongooseOptions !== undefined && this._mongooseOptions.populate !== undefined)
        ||
      (this.options !== undefined && (this.options.populate !== undefined || this.options.stopPopulation === true || this.options.skipPopulation === true))
    ) {
      return next();
    }

    // For preventing bug for deepPopulation
    for (let i = 0; i < populatePaths.length; i++) {
      (populatePaths[i].options = populatePaths[i].options || {}).stopPopulation = true;

      if (populatePaths[i].populate !== undefined) {
        let deepPopulateObject = populatePaths[i].populate;

        if (!Array.isArray(deepPopulateObject)) {
          deepPopulateObject = [deepPopulateObject];
        }

        for (let j = 0; j < deepPopulateObject.length; j++) {
          (deepPopulateObject[j].options = deepPopulateObject[j].options || {}).stopPopulation = true;
        }

      }

      this.populate(populatePaths[i]);
    }

    return next();
  };
}

function convertDeepPopulateObjectToQueryObject (populateObject) {
  if (Array.isArray(populateObject)) {
    return populateObject.map(function (key) {
      return { path: key };
    });
  }

  return Object.keys(populateObject).map(function (key) {
    if (isBoolean(populateObject[key])) {
      return { path: key };
    }
    return { path: key, populate: convertDeepPopulateObjectToQueryObject(populateObject[key]) };
  });
}

module.exports = function (schema) {
  schema.options = schema.options || {};
  schema.options.toObject = schema.options.toObject || {};
  schema.options.toJSON = schema.options.toJSON || {};

  schema.options.toJSON.virtuals = true;
  schema.options.toObject.virtuals = true;

  mongoose.Query.prototype.skipPopulation = function (skipPopulation = true) {
    this.setOptions({ ...this.options, skipPopulation: skipPopulation === true }, true);
    return this;
  };

  let populatePaths = [];

  if (schema.options.deepPopulate !== undefined) {
    populatePaths = populatePaths.concat(convertDeepPopulateObjectToQueryObject(schema.options.deepPopulate));
  }

  if (populatePaths.length > 0) {
    const populateHandler = getPopulateHandler(populatePaths);

    schema
      .pre('find', populateHandler)
      .pre('findOne', populateHandler)
      .post('save', function (doc, next) {
        populateHandler.call(doc, next);
      })
      .post('findOneAndUpdate', function (doc, next) {
        populateHandler.call(doc, next);
      })
      .post('findOneAndRemove', function (doc, next) {
        populateHandler.call(doc, next);
      })
      .post('update', function (doc, next) {
        populateHandler.call(doc, next);
      });
  }
}
