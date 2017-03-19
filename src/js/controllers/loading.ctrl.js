angular.module('watchit')

    .controller('LoadingCtrl', ($scope, Storage, API, $state) => {
        API.getDomain().then(domain => {
            API.setDomain(domain);
            Storage.setDomain(domain);

            $state.go('home');
        });
    });