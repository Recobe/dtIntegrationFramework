const fs = require('fs');
const DigitalTwinInterface = require('../interfaces/DigitalTwinInterface');

class WOT extends DigitalTwinInterface {
  constructor(modelName, mdh) {
    super(modelName, mdh);
  }

  receiveModel() {
    const pumpFile = JSON.parse(fs.readFileSync('./dt/wot/pumpL.json'));
    this.parser(pumpFile);
    const trackingFile = JSON.parse(fs.readFileSync('./dt/wot/trackingL.json'));
    this.parser(trackingFile);
  }

  parser(json) {
    let model = { type: json['@type'], measurements: [{ name: 'attributes', attributes: [] }], businessData: [], links: json.links };
    for (let prop in json.properties) {
      model.measurements[0].attributes.push({ id: prop, type: this.getType(json.properties[prop].type) })
    };
    super.handleModel(model);
  }

  getType(type) {
    switch (type) {
      case 'ID':
        return 'uuid';
      case 'integer':
        return 'bigint';
      case 'date':
        return 'date';
      case 'double':
        return 'double precision';
      case 'dateTime':
        return 'timestamp';
      case 'string':
        return 'text';
    }

  }
}

module.exports = WOT;