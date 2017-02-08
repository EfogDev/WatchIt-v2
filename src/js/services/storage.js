angular.module('watchit')

    .service('Storage', function ($localStorage) {
        let getSerial = (serialLink) => {
            let serial = _.find(serials, s => s.link == serialLink);

            if (!serial)
                throw new Error('Serial does not exist.');

            return serial;
        };

        this.findSerial = (serialLink) => {
            let serial;

            try {
                serial = _.find(serials, s => s.link == serialLink);
            } catch (e) {
                return null;
            }

            return serial;
        };

        this.getSerialsList = () => {
            return serials;
        };

        this.addSerial = (link, name, info) => {
            if (serials.filter(s => s.link == link).length)
                throw new Error('Serial already exists.');

            serials.push({
                watched: false,
                season: -1,
                episode: -1,
                time: 0,
                image: '',
                link,
                name,
                info
            });
        };

        this.removeSerial = (serialLink) => {
            serials.splice(_.findIndex(serials, s => s.link == serialLink), 1);
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