angular.module('watchit')

    .service('Storage', function ($localStorage) {
        let getSerial = (serialLink) => {
            let serial = _.find(serials, s => s.link == serialLink);

            if (!serial)
                throw new Error('Serial does not exist.');

            return serial;
        };

        this.getSerialsList = () => {
            return serials;
        };

        this.addSerial = (link) => {
            if (serials.filter(s => s.link == link).length)
                throw new Error('Serial already exists.');

            serials.push({
                watched: false,
                episode: -1,
                time: 0,
                image: '',
                link
            });
        };

        this.removeSerial = (serialLink) => {
            delete getSerial(serialLink);
        };

        this.updateTime = (serialLink, episode, time) => {
            Object.assign(getSerial(serialLink), {episode, time});
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