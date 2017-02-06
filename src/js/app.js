angular.module('watchit', ['ui.router', 'ngStorage'])

    .config(($stateProvider, $urlRouterProvider) => {
        $stateProvider
            .state({
                name: 'home',
                url: '/',
                templateUrl: 'views/home.html',
                controller: 'HomeCtrl'
            });

        $urlRouterProvider.otherwise('/');
    });