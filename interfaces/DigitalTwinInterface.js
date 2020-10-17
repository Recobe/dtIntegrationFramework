const joi = require('joi');
//const MetadataHandler = require('../MetadataHandler');


const dtSchema = joi.object({
  type: joi.string().required(),
  measurements: joi.array().items(
    joi.object({
      name: joi.string().required(),
      attributes: joi.array().items(
        joi.object({
          id: joi.string().required(),
          type: joi.string().valid('timestamp', 'text', 'double precision', 'bigint', 'uuid', 'date').required(),
        })
      )
    })
  ),
  businessData: joi.array().items(
    joi.object({
      name: joi.string().required(),
      attributes: joi.array().items(
        joi.object({
          id: joi.string().required(),
          type: joi.string().valid('timestamp', 'text', 'double precision', 'bigint', 'uuid', 'date').required(),
        })
      )
    })
  ),
  links: joi.array().items(
    joi.object({
      rel: joi.string().required(),
      href: joi.string().required(),
      type: joi.string().required(),
    })
  )
});

class DigitalTwinInterface {
  constructor(modelName, mdh) {
    this.modelName = modelName;
    this.mdHandler = mdh;
    console.log(`Digital Twin Interface for ${this.modelName}`);
  }

  /**
   * This function needs to call the handleModel function in the end
   */
  receiveModel() {
    console.log('super');
    this.handleModel(model);
  }

  handleModel(model) {
    try {
      joi.attempt(model, dtSchema);
      this.mdHandler.createSchema(model);
    } catch (error) {
      console.error(`parsing error: ${error}`);
    }
  }
}

module.exports = DigitalTwinInterface;