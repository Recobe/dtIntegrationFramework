const opcua = require("node-opcua");
const async = require("async");


// const endpointUrl = "opc.tcp://<hostname>:4334/UA/MyLittleServer";
const endpointUrl = "opc.tcp://localhost:4334/UA/OPCServer";
const client = opcua.OPCUAClient.create({
  endpoint_must_exist: false
});
client.on("backoff", (retry, delay) =>
  console.log(
    "still trying to connect to ",
    endpointUrl,
    ": retry =",
    retry,
    "next attempt in ",
    delay / 1000,
    "seconds"
  )
);

async.series([

  // step 1 : connect to
  function (callback) {
    client.connect(endpointUrl, function (err) {
      if (err) {
        console.log(" cannot connect to endpoint :", endpointUrl);
      } else {
        console.log("connected !");
      }
      callback(err);
    });
  },

  // step 2 : createSession
  function (callback) {
    client.createSession(function (err, session) {
      if (err) {
        return callback(err);
      }
      the_session = session;
      callback();
    });
  },

  // step 3 : browse
  function (callback) {
    the_session.browse("ns=1;i=1000", function (err, browseResult) {
      if (!err) {
        console.log("Browsing pump: ");
        for (let reference of browseResult.references) {
          console.log(reference.browseName.toString(), reference.nodeId.toString());
          the_session.browse(reference.nodeId.toString(), function (err, browseResult) {
            if (!err) {
              for (let ref of browseResult.references) {
                console.log(`In ${reference.browseName.toString()}: ${ref.browseName.toString()}, ${ref.nodeId.toString()}`);
              }
            }
            callback(err);
          });
        }
      }
      callback(err);
    });
  },

   // step 3 : browse
   function (callback) {
    the_session.browse("ns=1;i=1001", function (err, browseResult) {
      if (!err) {
        console.log("Browsing HU: ");
        for (let reference of browseResult.references) {
          console.log(reference.browseName.toString(), reference.nodeId.toString());
        }
      }
      callback(err);
    });
  },
  // close session
  function (callback) {
    the_session.close(function (err) {
      if (err) {
        console.log("closing session failed ?");
      }
      callback();
    });
  }

],
  function (err) {
    if (err) {
      console.log(" failure ", err);
    } else {
      console.log("done!");
    }
    client.disconnect(function () { });
  });