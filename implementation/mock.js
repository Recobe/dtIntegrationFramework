const fs = require('fs');
const rp = require('request-promise-native');
const BusinessDataIntergrationInterface = require('../interfaces/BusinessDataIntergrationInterface');

class Mock extends BusinessDataIntergrationInterface {
  constructor(businessSystem, dh) {
    super(businessSystem, dh);
  }

  async getData(name, id) {
    let path = this.parseName(name);
    try {
      let data = JSON.parse(await rp(`http://localhost:3000/${path}/${id}`));
      let rData = {
        name: name,
        attributes: [],
      }
      if (!this.isArray(data)) {
        rData.attributes[0] = [];
        for (let prop in data) {
          rData.attributes[0].push({ name: prop, value: data[prop] });
        }
      } else {
        data.forEach((ele, i) => {
          rData.attributes.push([]);
          for (let prop in ele) {
            rData.attributes[i].push({ name: prop, value: ele[prop] });
          }
        });
      }
      super.handleData(rData);
    } catch (e) {
      console.log(`error while reading business data ${e}`);
    }
  }

  isArray(what) {
    return Object.prototype.toString.call(what) === '[object Array]';
  }

  parseName(name) {
    switch (name) {
      case 'bp_location':
        return 'bp';
      case 'material_threshold':
        return 'material';
      case 'pump_notification':
        return 'notification';
    }
  }

  async getMetadata(link){
    try{
      let data = await rp(link);
      data = JSON.parse(data);
      let md = [];
      for(let prop in data[0]){
        md.push({id: prop, type: this.parseType(typeof data[0][prop])});
      }
      return(md);
    } catch(e){
      console.log(`Error while reading metadata from link ${e}`);
    }
  }

  parseType(type){
    switch (type) {
      case 'number':
        return 'double precision';
      case 'string':
        return 'text';
    }
  }
}

module.exports = Mock;