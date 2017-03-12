angular.module('watchit', ['ui.router', 'ngStorage'])

    .config(($stateProvider, $urlRouterProvider) => {
        Array.prototype.last = function () {
            return this[this.length - 1];
        };

        $stateProvider
            .state({
                name: 'home',
                url: '/',
                templateUrl: 'views/home.html',
                controller: 'HomeCtrl'
            })
            .state({
                name: 'serial-info',
                url: '/serial-info?link&name',
                parent: 'home',
                templateUrl: 'views/serial-info.html',
                controller: 'SerialInfoCtrl'
            })
            .state({
                name: 'serial',
                url: '/serial?link',
                parent: 'home',
                templateUrl: 'views/serial.html',
                controller: 'SerialCtrl'
            })
            .state({
                name: 'episode',
                url: '/episode?link&season&episode',
                parent: 'home',
                templateUrl: 'views/episode.html',
                controller: 'EpisodeCtrl'
            })
            .state({
                name: 'settings',
                url: '/settings',
                parent: 'home',
                templateUrl: 'views/settings.html',
                controller: 'SettingsCtrl'
            });

        $urlRouterProvider.otherwise('/');
    });