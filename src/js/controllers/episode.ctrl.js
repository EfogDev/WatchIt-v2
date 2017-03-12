angular.module('watchit')

    .controller('EpisodeCtrl', ($scope, $stateParams, Storage, API, $sce) => {
        $scope.options = {
            serialLink: $stateParams.link,
            season: parseInt($stateParams.season),
            episode: parseInt($stateParams.episode)
        };

        $scope.currentSource = '';
        $scope.serial = Storage.findSerial($scope.options.serialLink);
        $scope.sources = {};

        API.getVideo($scope.options.serialLink, $scope.options.season, $scope.options.episode).then(sources => {
            $scope.sources = sources;
            $scope.currentSource = $sce.trustAsResourceUrl(sources['360']);

            $scope.update();
        });

        $scope.update = () => {
            setTimeout(() => {
                if (videojs.players.video)
                    videojs.players.video.dispose();

                let player = videojs('video',  {plugins: {
                    videoJsResolutionSwitcher: {
                        default: 'low',
                        dynamicLabel: true
                    }
                }}, () => {
                    player.updateSrc(Object.keys($scope.sources).map(quality => {
                        return {
                            src: $scope.sources[quality],
                            type: 'application/x-mpegURL',
                            label: quality,
                            res: parseInt(quality)
                        };
                    }));

                    player.play();
                });
            });
        };
    });