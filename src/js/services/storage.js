angular.module('watchit')

    .service('Storage', function ($localStorage, API) {
        let getSerial = (serialLink) => {
            let serial = _.find(serials, s => s.link === serialLink);

            if (!serial)
                throw new Error('Serial does not exist.');

            return serial;
        };

        this.findSerial = (serialLink) => {
            return _.find(serials, s => s.link === serialLink);
        };

        this.getSerialsList = () => {
            return serials;
        };

        this.addSerial = (link, name, info) => {
            if (serials.filter(s => s.link === link).length)
                throw new Error('Serial already exists.');

            serials.push({
                watched: false,
                seasons: [],
                updated: false,
                image: '',
                link,
                name,
                info
            });
        };

        this.removeSerial = (serialLink) => {
            serials.splice(_.findIndex(serials, s => s.link === serialLink), 1);
        };

        this.updateSerials = () => {
            serials.forEach(serial => {
                serial.isUpdating = true;

                API.loadSeasons(serial.link).then(seasons => {
                    this.updateSeasons(serial.link, seasons);

                    let lastSeason = serial.seasons.last();
                    API.loadEpisodes(serial.link, lastSeason.id).then(episodes => {
                        this.updateEpisodes(serial.link, lastSeason.id, episodes);

                        serial.isUpdating = false;
                    });
                });
            });
        };

        this.updateSeasons = (serialLink, seasons) => {
            let serialSeasons = getSerial(serialLink).seasons;

            if (serialSeasons.length < seasons.length) {
                getSerial(serialLink).seasons = serialSeasons.concat(seasons.splice(serialSeasons.length - seasons.length).map(season => {
                    season.updated = true;

                    return season;
                }));

                getSerial(serialLink).updated = true;
            }
        };

        this.updateEpisodes = (serialLink, seasonId, episodes) => {
            let season = getSerial(serialLink).seasons.filter(s => s.id === seasonId)[0];

            if (!season)
                return null;

            if (!season.episodes) {
                season.episodes = episodes;
            } else {
                if (episodes.length > season.episodes.length) {
                    season.episodes = season.episodes.concat(episodes.splice(season.episodes.length - episodes.length));

                    getSerial(serialLink).updated = true;
                }
            }
        };

        this.updateTime = (serialLink, season, episode, time) => {
            Object.assign(getSerial(serialLink), {season, episode, time});
        };

        this.setWatched = (serialLink, watchedState) => {
            getSerial(serialLink).watched = !!watchedState;
        };

        this.load = () => {
            if (!Array.isArray($localStorage.serials))
                $localStorage.serials = [];

            return $localStorage.serials;
        };

        let serials = this.load();
    });