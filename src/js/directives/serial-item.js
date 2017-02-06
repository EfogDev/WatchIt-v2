angular.module('watchit')

    .directive('serialItem', () => {
        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            templateUrl: 'views/serial-item.html',
            link: (scope, element) => {
                $(element).find('img').on('load', () => {
                    scope.loaded = true;
                    scope.$apply();
                });
            },
            controller: ($scope, API) => {
                if (!$scope.data.image && $scope.data.link) {
                    API.loadImage($scope.data.link).then(url => {
                        $scope.data.image = url;
                    });
                }
            }
        }
    });