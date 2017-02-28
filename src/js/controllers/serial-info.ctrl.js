angular.module('watchit')

    .controller('SerialInfoCtrl', ($scope, $stateParams, Storage, API) => {
        let link = $stateParams.link;

        $scope.serialExists = !!Storage.findSerial(link);
        $scope.loading = true;

        API.loadData(link).then(data => {
            $scope.data = data;
            $scope.loading = false;
        });

        $scope.add = () => {
            Storage.addSerial(link, $stateParams.name, $scope.data.voice);
            $scope.serialExists = true;

            API.loadSeasons(link).then(seasons => {
                Storage.updateSeasons(link, seasons);
            });
        };

        $scope.remove = () => {
            Storage.removeSerial(link);
            $scope.serialExists = false;
        };
    });