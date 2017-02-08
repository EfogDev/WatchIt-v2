angular.module('watchit')

    .controller('SerialCtrl', ($scope, $stateParams, Storage, API) => {
        let link = $stateParams.link;
        let serial = Storage.findSerial(link);

        $scope.loading = true;

        API.loadEpisodes(link).then(data => {
            Storage.updateSerial(data);
            $scope.loading = false;
        });
    });