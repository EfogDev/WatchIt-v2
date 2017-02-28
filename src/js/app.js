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
            });

        $urlRouterProvider.otherwise('/');

        const {ipcRenderer} = require('electron');
        ipcRenderer.send('debug', null);

        ipcRenderer.once('debug', debug => {
            if (!debug)
                return;

            $('<div />').attr('class', 'refresh-button').appendTo(document.body).click(() => {
                location.reload();
            });
        });
    });