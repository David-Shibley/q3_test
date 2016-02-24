angular.module('warRoom')
  .factory('ServerConnectionService', ServerConnectionService)
  .factory('StatusService', StatusService);

// inject dependencies for server connection service
ServerConnectionService.$inject = ['$http']

function ServerConnectionService($http) {
  return {
    // connect to all servers
    connectAllServers: function() {
      return $http.get('/api/homes')
        .then((response) => response.data);
    },
    // connect to a single server based on server id
    connectSingleServer: function (id) {
      return this.connectAllServers()
        .then((homes) => homes.find((home) => parseInt(home.id) === parseInt(id)))
    }
  }
}

// inject dependencies for status service
StatusService.$inject = ['$stateParams']

function StatusService ($stateParams) {
  var socket = io()
  var callbacks = []
  console.log($stateParams.id);
  //initialize socket connection
  socket.on('status', function (data) {
    //iterate over every callback in callbacks array
    callbacks.forEach(function (callback) {
      var status, average;
      data.body.forEach(function (server, index) {
        console.log(server);
        //check to make sure the server id matches the id in the url
        if (server.id == $stateParams.id) {
          status = server.responseTime;
          average = data.average[server.id].average
        }
      })
      callback({status: status, average: average})
    })
  })
  return {
    on: function (callback) {
      callbacks.push(callback)
    }
  }
}
