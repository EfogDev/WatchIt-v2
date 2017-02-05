angular.module('watchit', ['ui.router'])

    .config(($stateProvider, $urlRouterProvider) => {
        $stateProvider
            .state({
                name: 'home',
                url: '/',
                templateUrl: 'views/home.html'
            });

        $urlRouterProvider.otherwise('/');
    });