require('dotenv').load();

var Express = require("express")
var Socket = require("socket.io")
var http = require("http")
var unirest = require('unirest')
var db = require('mongodb');

var app = Express()
var server = http.Server(app)
var io = Socket(server)

function reduceFindAverage(servers) {
  var list = servers.reduce(function (serverIndex, server, i, arr) {
    serverIndex[server.id] = serverIndex[server.id] || {id: server.id, responseTime: [], average: 0 }
    serverIndex[server.id].responseTime.push(server.currentBid);
    var sum = 0;
    for (var i = 0; i < serverIndex[server.id].responseTime.length; i++) {
      sum += serverIndex[server.id].responseTime[i]
    }
    serverIndex[server.id].average = sum/serverIndex[server.id].responseTime.length
    return serverIndex
  }, {});
  return list
}

io.on("connection", function (socket) {
  setInterval(function () {
    unirest.get('http://galvanize-warroom-status.herokuapp.com/')
      .end(function (data) {
        db.get('servers').find().then(function (servers) {
          var average = reduceFindAverage(servers);
          socket.emit("bid", {
            body: data.body,
            average: average,
          })
        })
      })
  }, 3000)
})

app.use(Express.static("../client"))

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

server.listen(3000, function () {
  console.log("listening on 3000")
})
