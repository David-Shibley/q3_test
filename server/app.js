require('dotenv').load();

var Express = require("express")
var Socket = require("socket.io")
var http = require("http")
var unirest = require('unirest')
var db = require('mongodb');
var bodyParser = require('body-parser');

var app = Express()
var server = http.Server(app)
var io = Socket(server)


// var port = normalizePort(process.env.PORT || '3000');
// app.set('port', port);

function reduceFindAverage(servers) {
  var serversArray = []
  serversArray.push(servers)
  var list = serversArray.reduce(function (serverIndex, server) {
    console.log("server ", server.id);
    serverIndex[server.id] = serverIndex[server.id] || {id: server.id, responseTime: [], average: 0 }
    serverIndex[server.id].responseTime.push(server.responseTime);
    var sum = 0;
    for (var i = 0; i < serverIndex[server.id].responseTime.length; i++) {
      sum += serverIndex[server.id].responseTime[i]
    }
    serverIndex[server.id].average = sum/serverIndex[server.id].responseTime.length
    console.log("index ", serverIndex);
    return serverIndex
  }, {});
  return list
}
//
// function normalizePort(val) {
//   var port = parseInt(val, 10);
//
//   if (isNaN(port)) {
//     // named pipe
//     return val;
//   }
//
//   if (port >= 0) {
//     // port number
//     return port;
//   }
//
//   return false;
// }
//
// function onError(error) {
//   if (error.syscall !== 'listen') {
//     throw error;
//   }
//
//   var bind = typeof port === 'string'
//     ? 'Pipe ' + port
//     : 'Port ' + port;
//
//   // handle specific listen errors with friendly messages
//   switch (error.code) {
//     case 'EACCES':
//       console.error(bind + ' requires elevated privileges');
//       process.exit(1);
//       break;
//     case 'EADDRINUSE':
//       console.error(bind + ' is already in use');
//       process.exit(1);
//       break;
//     default:
//       throw error;
//   }
// }
//
// function onListening() {
//   var addr = server.address();
//   var bind = typeof addr === 'string'
//     ? 'pipe ' + addr
//     : 'port ' + addr.port;
//   debug('Listening on ' + bind);
// }
// db.get('houses').find().then(function (houses) {
//   // var average = reduceFindAverage(houses);
//   var average = findAverage(houses);
//   socket.emit("bid", {
//     body: data.body,
//     average: average,
//     time: new Date()
//   })
// })
io.on("connection", function (socket) {
  setInterval(function () {
    unirest.get('http://galvanize-warroom-status.herokuapp.com/')
      .end(function (data) {
        return db.MongoClient.connect(process.env.MONGOLAB_URI, function(err, db){
          var servers = db.collection('servers');
          servers.find().next(function (err, serverData) {
            console.log("data from mongo", serverData);
            // var outGoingData = [];
            // outGoingData.push(serverData)
            var average = reduceFindAverage(serverData);
            socket.emit("status", {
              body: data.body,
              average: average,
            })
          })
        })
      })
  }, 3000)
})
// app.use(Express.static(__dirname + './client'));

app.use(Express.static("../client"))
app.use(bodyParser.json())


app.get('/api/homes', function (request, response) {
  unirest.get('http://galvanize-warroom-status.herokuapp.com/')
    .end(function (data) {
      Promise.all(
        data.body.map(function (server) {
          return db.MongoClient.connect(process.env.MONGOLAB_URI, function(err, db){
            console.log(server);
            var servers = db.collection('servers');
            servers.insert(server);
          })
        })
      ).then(function (result) {
        response.json(data.body)
      })
    })
})

app.get('/api/settings', function (request, response) {
  return db.MongoClient.connect(process.env.MONGOLAB_URI, function(err, db){
    var servers = db.collection('settings');
    servers.find().next(function (err, serverData) {
      response.send(serverData)
    });
  })
})

app.post('/api/settings', function (request, response) {
  return db.MongoClient.connect(process.env.MONGOLAB_URI, function(err, db){
    var settings = db.collection('settings');
    console.log("success!");
    settings.update(
      {},
      {
        warning:request.body.warning,
        critical:request.body.critical
      },
      { upsert: true }
    )
  })
  response.send("data stored")
})
//
// server.listen(3000);
// server.on('error', onError);
server.listen(3000, function () {
  console.log("listening on 3000")
})

module.exports = app;
