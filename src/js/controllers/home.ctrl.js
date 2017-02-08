angular.module('watchit')

    .controller('HomeCtrl', ($scope, $state, Storage, API) => {
        $scope.search = {
            loading: false,
            text: '',
            results: []
        };

        $scope.serials = Storage.getSerialsList();

        $scope.$watch('search.text', text => {
            if (text.length > 2) {
                $scope.search.loading = true;

                API.search(text).then(list => {
                    if (!$scope.search.loading)
                        return;

                    $scope.search.results = list;
                    $scope.search.loading = false;

                    $scope.$apply();
                });
            } else {
                $scope.search.loading = false;
                $scope.search.results = [];
            }
        });

        $scope.goToSerialInfo = (serial) => {
              $state.go('serial-info', {link: serial.link, name: serial.name});
        };

        $scope.openSerial = (serial) => {
            $state.go('serial', {link: serial.link, name: serial.name});
        };
    });