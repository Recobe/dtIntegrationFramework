const joi = require('joi');

const dataSchema = joi.object({
  name: joi.string().required(),
  attributes: joi.array().items(
    joi.array().items(
      joi.object({
        name: joi.string().required(),
        value: joi.required()
      })
    )
  )
});

class BusinessDataIntergrationInterface {
  constructor(businessSystem, dh) {
    this.bs = businessSystem;
    this.dataHandler = dh;
    console.log(`Data Interface for ${this.bs}`);
  }

  /**
   * This function needs to call the handleData function in the end
   */
  getData(name, id) {
    this.handleData(data);
  }

  handleData(data) {
    try {
      joi.attempt(data, dataSchema);
      this.dataHandler.insertData(data);
    } catch (error) {
      console.error(`parsing error: ${error}`);
    }
  }

  async getMetadata(link){

  }
}

module.exports = BusinessDataIntergrationInterface;