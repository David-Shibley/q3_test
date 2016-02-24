angular.module('warRoom')
  .controller('HomeController', HomeController)
  .controller('DetailController', DetailController)
  .controller('SettingsController', SettingsController);

//inject dependencies for home controller
HomeController.$inject = ['$scope', 'ServerConnectionService'];
//controller for home page
function HomeController($scope, ServerConnectionService) {
  //make a connection to the war room client api
  ServerConnectionService.connectAllServers()
    .then(function(servers){
      //set a variable equal to the data of all the servers
      $scope.servers = servers;
    });
}

//inject dependencies for detail controller
DetailController.$inject = ['$scope', 'ServerConnectionService', '$stateParams', 'StatusService']
//controller for each servers detail page
function DetailController($scope, ServerConnectionService, $stateParams, StatusService) {
  //make a connection to the war room client api for a specific server
  ServerConnectionService.connectSingleServer($stateParams.id)
    .then((server) => {
      //set a variable equal to the data of the single server
      $scope.server = server
    })
  $scope.statuses = []
  StatusService.on(function (data) {
    $scope.statuses.push(data)
    $scope.average = data.average
    console.log($scope.statuses)
    $scope.$apply()
  })
}

//inject dependencies for detail controller
SettingsController.$inject = ['$scope', '$http']
//controller for each servers detail page
function SettingsController($scope, $http) {
  // $scope.settings = {
  //   critical: 0.05,
  //   warning: 0.5
  // }
  $http.get('/api/settings').then(function(data){
    if (data) {
      console.log("data ", data.data);
      $scope.settings = {};
      $scope.settings.id = data.data._id;
      $scope.settings.critical = data.data.critical;
      $scope.settings.warning = data.data.warning;
    }
  });
  $scope.submit = function(){
    console.log('settings ', $scope.settings);
    $http.post('/api/settings', $scope.settings)
  }
}
