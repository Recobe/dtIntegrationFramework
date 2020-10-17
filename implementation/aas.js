const fs = require('fs');
const DigitalTwinInterface = require('../interfaces/DigitalTwinInterface');

class AAS extends DigitalTwinInterface{
  constructor(modelName, mdh){
    super(modelName, mdh);
  }

  receiveModel(){
    const pumpFile = JSON.parse(fs.readFileSync('./dt/aas/pump.json'));
    this.parser(pumpFile);
    const trackingFile = JSON.parse(fs.readFileSync('./dt/aas/tracking.json'));
    this.parser(trackingFile);
  }

  parser(json){
    json.assetAdministrationShells.forEach(async aas => {
      let model = {
        type: aas.idShort,
        businessData: [],
        measurements: [],
      }
      aas.submodels.forEach(subM => {
        let key = subM.keys[0].value;
        json.submodels.forEach(subMod => {
          if (subMod.identification.id === key){
            let elements = [];
            subMod.submodelElements.forEach(ele => {
              elements.push({id: ele.idShort, type: this.getType(ele.valueType)})
            });
            if (subMod.category === 'businessData'){
              model.businessData.push({name: subMod.idShort, attributes: elements});
            } else if (subMod.category === 'measurement'){
              model.measurements.push({name: subMod.idShort, attributes: elements});
            }
          }
        })
      });
      super.handleModel(model);
    })
  }

  getType(type){
    switch(type){
      case 'ID':
        return 'uuid';
      case 'int':
        return 'bigint';
      case 'date':
        return 'date';
      case 'double':
        return 'double precision';
      case 'dateTime':
        return 'timestamp';
    }

  }
}

module.exports = AAS;