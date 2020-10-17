const AAS = require('./implementation/aas');
const WOT = require('./implementation/wot');
const Mock = require('./implementation/mock');

const MetadataHandler = require('./MetadataHandler');
const DataHandler = require('./DataHandler');

/*const express = require('express');
const app = express();
const port = 3000;*/

async function startAAS(){
  const mdh = new MetadataHandler();
  await mdh.connect();
  const aas = new AAS('AAS', mdh);
  aas.receiveModel();
}

async function startWOT(){
  const mdh = new MetadataHandler();
  await mdh.connect();
  const wot = new WOT('WOT', mdh);
  wot.receiveModel();
}

async function loadData(){
  const dh = new DataHandler();
  await dh.connect();
  const mock = new Mock('mock server', dh);
  mock.getData('material_threshold', 'f96b409d-1827-462b-96fa-d1c6e3ebefc9');
  mock.getData('pump_notification', '84e0fda8-943e-4fac-b50b-91772438c9be');
}

async function onboardDt(){
  const mock =  new Mock('mock server', null);
  const dh = new DataHandler(mock);
  await dh.connect();
  dh.onboardDt({
    digitalTwinId: '299c8bb6-f107-47c1-af41-628e22b938b1',
    type: 'pump',
    attributes: [
      {
        name: 'attributes',
        attributes: [
          {
            name: 'equipmentid',
            value: '84e0fda8-943e-4fac-b50b-91772438c9be'
          }
        ]
      }
    ]
  });
}

startAAS();
//startWOT();
//loadData();
//onboardDt();


