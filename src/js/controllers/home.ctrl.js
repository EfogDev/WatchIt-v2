angular.module('watchit')

    .controller('HomeCtrl', ($scope, $state, Storage, API) => {
        $scope.search = {
            hidden: false,
            loading: false,
            text: '',
            results: []
        };

        $scope.options = {
            loading: false,
            showSerials: true
        };

        $scope.serials = Storage.getSerialsList();
        $scope.serial = {
            data: null,
            season: null,
            episode: null
        };

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
            $state.go('serial-info', {link: serial.link, name: serial.name});

            $scope.options.loading = true;
            $scope.options.showSerials = false;
            $scope.search.hidden = true;

            API.loadSeasons(serial.link).then(seasons => {
                Storage.updateSeasons(serial.link, seasons);

                $scope.options.loading = false;
                $scope.serial.data = Storage.findSerial(serial.link);

                $scope.serial.data.updated = false;

                $scope.$apply();
            });
        };

        $scope.openSeason = season => {
            $scope.options.loading = true;

            API.loadEpisodes($scope.serial.data.link, season.id).then(episodes => {
                Storage.updateEpisodes($scope.serial.data.link, season.id, episodes);

                season.updated = false;

                $scope.serial.data = Storage.findSerial($scope.serial.data.link);
                $scope.serial.season = season.id;
                $scope.options.loading = false;

                $scope.$apply();
            });
        };

        $scope.openEpisode = episode => {
            $scope.serial.episode = episode.id;
            episode.watched = true;

            $state.go('episode', {link: $scope.serial.data.link, season: $scope.serial.season, episode: $scope.serial.episode});
        };

        $scope.findSeasonEpisodes = seasonId => {
            if (!$scope.serial.data)
                return false;

            let season = $scope.serial.data.seasons.filter(s => s.id == seasonId)[0];

            if (season) {
                return season.episodes;
            } else return null;
        };

        $scope.isSeasonWatched = season => {
            let seasons = $scope.findSeasonEpisodes(season.id);

            if (!seasons)
                return false;

            return seasons.every(e => e.watched);
        };

        $scope.isSerialUpdated = serial => {
            let found = Storage.findSerial(serial.link);

            return found.seasons.some(s => s.updated);
        };

        $scope.back = () => {
            if ($scope.serial.season !== null) {
                $scope.serial.season = null;
            } else {
                $scope.serial.data = null;
                $scope.options.showSerials = true;
                $scope.search.hidden = false;
            }
        };
    });