angular.module('watchit', ['ui.router', 'ngStorage'])

    .config(($stateProvider, $urlRouterProvider) => {
        $stateProvider
            .state({
                name: 'home',
                url: '/',
                templateUrl: 'views/home.html',
                controller: 'HomeCtrl'
            })
            .state({
                name: 'serial',
                url: '/serial?link',
                parent: 'home',
                templateUrl: 'views/serial.html',
                controller: 'SerialCtrl'
            });

        $urlRouterProvider.otherwise('/');
    });