const { Client } = require('pg');


class MetadataHandler{
  constructor(){
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

  createSchema(model){
    model.measurements.forEach(meas => {
      this.createTable(model, meas, 'meas');
    });
    model.businessData.forEach(bd => {
      this.createTable(model, bd, 'bd');
    });
    if(model.links.length > 0){
      this.createLinkSchema(model)
    }
  }

  async createLinkSchema(model){
    let query = `CREATE TABLE ${model.type}_links (rel text, href text, type text);`;
    try{
      let res = await this.client.query(query);
      model.links.forEach(async (link) => {
        let insert = `INSERT INTO ${model.type}_links VALUES ('${link.rel}', '${link.href}', '${link.type}');`;
        console.log(insert);
        try{
          let iRes = await this.client.query(insert);
          console.log(iRes);
        } catch(iE){
          console.log(`Error while inserting into link table ${iE}`);
        }
      });
      console.log(res);
    } catch(e){
      console.log(`Error while creating link table ${e}`);
    }
  }

  async connect(){
    try{
      if(!this.connected){
        this.connected = true;
        await this.client.connect();
        console.log('connected');
      }
    } catch(e){
      console.log(`Error in MetadataHandler: ${e}`);
    }
  }

  async createTable(model, obj, type){
    let query = 'CREATE TABLE ';
    query = query.concat(`${model.type}_${obj.name}(`);
    if(type === 'meas'){
      query = query.concat(`digitalTwinId uuid,`);
    }
    obj.attributes.forEach(attr => {
      query = query.concat(`${attr.id} ${attr.type},`);
    });
    query = query.substr(0, query.length - 1);
    query = query.concat(')');
    console.log(query);
    try {
      let res = await this.client.query(query);
      console.log(res);
    } catch(e){
      console.log(`Error in MetadataHandler: ${e}`);
    }
  }
}

module.exports = MetadataHandler;