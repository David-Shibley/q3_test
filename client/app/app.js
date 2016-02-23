angular.module('warRoom', ['ui.router'])
  .config(function($stateProvider, $urlRouterProvider){

    $urlRouterProvider.otherwise('/home');

    $stateProvider.state('home', {
      templateUrl: 'templates/home.html',
      controller: 'HomeController',
      url: '/home'
    }).state('detail', {
      templateUrl: 'templates/detail.html',
      controller: 'DetailController',
      url: '/home/:id'
    })
  });
