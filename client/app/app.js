angular.module('warRoom', ['ui.router'])
  .config(function($stateProvider, $urlRouterProvider){
    //catch any unknown routes and redirect to home
    $urlRouterProvider.otherwise('/home');
    $stateProvider.state('home', {
      //set controller and template for home route
      templateUrl: 'templates/home.html',
      controller: 'HomeController',
      url: '/home'
    }).state('detail', {
      //set controller and template for detail route
      templateUrl: 'templates/detail.html',
      controller: 'DetailController',
      url: '/home/:id'
    }).state('settings', {
      //set controller and template for settings route
      templateUrl: 'templates/settings.html',
      controller: 'SettingsController',
      url: '/settings'
    })
  });
