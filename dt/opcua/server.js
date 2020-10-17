const opcua = require("node-opcua");

const server = new opcua.OPCUAServer({
  port: 4334, // the port of the listening socket of the server
  resourcePath: "/UA/OPCServer", // this path will be added to the endpoint resource name
});

function post_initialize() {
  console.log("initialized");
  function construct_my_address_space(server) {

    const addressSpace = server.engine.addressSpace;
    const namespace = addressSpace.getOwnNamespace();

    // declare a new object
    const device = namespace.addObject({
      organizedBy: addressSpace.rootFolder.objects,
      browseName: "Pump",
      nodeId: "ns=1;i=1000",
    });

    const hu = namespace.addObject({
      organizedBy: addressSpace.rootFolder.objects,
      browseName: "HU",
      nodeId: "ns=1;i=1001",
    });

    const bp = namespace.addObject(
      {
        browseName: "BP",
        nodeId: "ns=1;i=1002",
      }
    );

    const material = namespace.addObject(
      {
        browseName: "Material",
        nodeId: "ns=1;i=1003",
      }
    );

    const pumpMeas = namespace.addObject(
      {
        componentOf: device,
        browseName: "pumpMeas",
      }
    );

    namespace.addVariable({
      componentOf: pumpMeas,
      browseName: "Status",
      dataType: "Int16",
    });

    namespace.addVariable({
      componentOf: pumpMeas,
      browseName: "FlowRate",
      dataType: "Double",
    });

    namespace.addVariable({
      componentOf: pumpMeas,
      browseName: "Vibration",
      dataType: opcua.DataType.Double,
    });

    namespace.addVariable({
      componentOf: pumpMeas,
      browseName: "Timestamp",
      dataType: "DateTime",
      value: {
        get: function () { return new opcua.Variant({ dataType: opcua.DataType.Double, value: new Date().getTime() }); }
      }
    });

    namespace.addVariable({
      componentOf: device,
      browseName: "EquipmentId",
      dataType: "Guid",
    });

    const noti = namespace.addObject(
      {
        componentOf: device,
        browseName: "Notification",
      }
    );

    namespace.addVariable({
      componentOf: noti,
      browseName: "NotificationId",
      dataType: "Guid",
    });

    namespace.addVariable({
      componentOf: noti,
      browseName: "NotificationType",
      dataType: "Int16",
    });

    namespace.addVariable({
      componentOf: noti,
      browseName: "Cause",
      dataType: "Int16",
    });

    namespace.addVariable({
      componentOf: noti,
      browseName: "Date",
      dataType: "DateTime",
    });

    const huMeas = namespace.addObject(
      {
        componentOf: hu,
        browseName: "huMeas",
      }
    );

    namespace.addVariable({
      componentOf: huMeas,
      browseName: "Timestamp",
      dataType: "DateTime",
      value: {
        get: function () { return new opcua.Variant({ dataType: opcua.DataType.Double, value: new Date().getTime() }); }
      }
    });

    namespace.addVariable({
      componentOf: huMeas,
      browseName: "longitude",
      dataType: "Double",
    });

    namespace.addVariable({
      componentOf: huMeas,
      browseName: "latitude",
      dataType: "Double",
    });



    namespace.addVariable({
      componentOf: bp,
      browseName: "BPId",
      dataType: "Guid",
    });

    namespace.addVariable({
      componentOf: bp,
      browseName: "BPlongitude",
      dataType: "Double",
    });

    namespace.addVariable({
      componentOf: bp,
      browseName: "BPlatitude",
      dataType: "Double",
    });

    namespace.addVariable({
      componentOf: huMeas,
      browseName: "temperature",
      dataType: "Double",
    });



    namespace.addVariable({
      componentOf: material,
      browseName: "materialId",
      dataType: "Guid",
    });

    namespace.addVariable({
      componentOf: material,
      browseName: "tempThreshold",
      dataType: "Double",
    });

    const pm = namespace.addReferenceType({
      componentOf: hu,
      browseName: "packedMaterial",
      inverseName: "packedMaterial"
    });

    const buyer = namespace.addReferenceType({
      componentOf: hu,
      browseName: "buyer",
      inverseName: "buyer"
    });

    hu.addReference({
      nodeId: material.nodeId,
      referenceType: pm
    });
    hu.addReference({
      nodeId: material.nodeId,
      referenceType: buyer
    });


  }
  construct_my_address_space(server);
  server.start(function () {
    console.log("Server is now listening ... ( press CTRL+C to stop)");
    console.log("port ", server.endpoints[0].port);
    const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
    console.log(" the primary server endpoint url is ", endpointUrl);
  });
}
server.initialize(post_initialize);