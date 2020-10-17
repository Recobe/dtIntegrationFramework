const { Client } = require('pg');
const joi = require('joi');
const MetadataHandler = require('./MetadataHandler');

const dtSchema = joi.object({
  digitalTwinId: joi.string().required(),
  type: joi.string().required(),
  attributes: joi.array().items(
    joi.object({
      name: joi.string().required(),
      attributes: joi.array().items(
        joi.object({
          name: joi.string().required(),
          value: joi.required()
        })
      )
    })
  )
});

class DataHandler {
  constructor(bdii) {
    this.mdh = new MetadataHandler();
    this.bdii = bdii;
    this.connected = false;
    this.client = new Client({
      user: 'admin',
      host: 'localhost',
      database: 'iotdb',
      password: 'admin',
      port: 5432,
      //connectionString: "postgres://admin:admin@db:5432/iotdb"
    })
  }

  insertData(data) {
    data.attributes.forEach(async (ent) => {
      let col = '(';
      let val = '(';
      ent.forEach(attr => {
        col = col.concat(`${attr.name},`);
        val = val.concat(`'${attr.value}',`);
      });
      col = col.substring(0, col.length - 1).concat(')');
      val = val.substring(0, val.length - 1).concat(')');
      let query = `INSERT INTO ${data.name} ${col} VALUES ${val}`;
      console.log(query);
      try {
        let res = await this.client.query(query);
        console.log(`inserted ${res}`);
      } catch (e){
        console.log(`Error during insert ${e}`);
      }
    })
  }

  async connect() {
    try {
      if (!this.connected) {
        this.connected = true;
        await this.client.connect();
        console.log('connected');
      }
    } catch (e) {
      console.log(`Error in MetadataHandler: ${e}`);
    }
  }

  async onboardDt(dt){
    joi.attempt(dt, dtSchema);
    dt.attributes.forEach(grp => {
      grp.attributes.push({name: 'digitaltwinid', value: dt.digitalTwinId});
      this.insertData({name: `${dt.type}_${grp.name}`, attributes: [grp.attributes]});
    });
    try {
      const links = await this.client.query(`Select * from ${dt.type}_links`);
      links.rows.forEach(link => {
        const para = link.href.substring(link.href.lastIndexOf('${')+2, link.href.lastIndexOf('}'));
        dt.attributes.forEach(attr => {
          attr.attributes.forEach(async (prop) => {
            if(para === prop.name){
              const uri = link.href.replace('${' + para + '}', prop.value);
              const md = await this.bdii.getMetadata(uri);
              console.log(md);
              this.mdh.connect();
              this.mdh.createSchema({
                type: dt.type,
                measurements: [],
                businessData: [
                  {
                    name: link.rel,
                    attributes: md
                  }
                ],
                links: []
              });
            }
          })
        })
      })
    } catch (e){
      console.log(`Error while creating schemas based on links ${e}`);
    }
  }
}

module.exports = DataHandler;