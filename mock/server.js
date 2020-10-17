const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');

const notis = JSON.parse(fs.readFileSync('./mock/notifications.json'));
const bps = JSON.parse(fs.readFileSync('./mock/bp.json'));
const materials = JSON.parse(fs.readFileSync('./mock/material.json'));


app.get('/notification/:equipmentId', (req, res) => {
  let response = [];
  notis.forEach(noti => {
    if (noti.equipmentId === req.params.equipmentId) {
      response.push(noti);
    }
  })
  res.json(response);
});

app.get('/bp/:bpId', (req, res) => {
  let sent = false;
  bps.forEach(bp => {
    if (bp.id === req.params.bpId) {
      sent = true;
      res.json(bp);
    }
  })
  if (!sent) {
    res.json([]);
  }
});

app.get('/material/:id', (req, res) => {
  let sent = false;
  materials.forEach(material => {
    if (material.material_id === req.params.id) {
      sent = true;
      res.json(material);
    }
  })
  if (!sent) {
    res.json([]);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});