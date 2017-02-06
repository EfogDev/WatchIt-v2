angular.module('watchit')

    .controller('SerialCtrl', ($scope, $stateParams, Storage, API) => {
        $scope.loading = true;

        API.loadData($stateParams.link).then(data => {
            $scope.data = data;
            $scope.loading = false;
        });
    });