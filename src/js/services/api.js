angular.module('watchit')

    .service('API', function ($http, DOM, Server) {
        const {ipcRenderer} = require('electron');
        let domain = '';

        this.getDomain = () => {
            return Server.send('domain');
        };

        this.setDomain = data => domain = data;

        this.loadSeasons = (link) => {
            return $http.get(link).then(response => {
                let el = DOM(response.data);
                let frame = el.querySelector('iframe[allowfullscreen][src*="/serial/"]');

                if (!frame)
                    throw new Error('Ошибка. Возможно, это не сериал?');

                return frame.getAttribute('src');
            }).then(url => {
                return Server.send('seasons', {url, link});
            });
        };

        this.loadEpisodes = (link, seasonId) => {
            return $http.get(link).then(response => {
                let el = DOM(response.data);
                let frame = el.querySelector('iframe[allowfullscreen][src*="/serial/"]');

                if (!frame)
                    throw new Error('Ошибка. Возможно, это не сериал?');

                return frame.getAttribute('src');
            }).then(url => {
               return Server.send('episodes', {url, link, seasonId});
            });
        };

        this.getVideo = (link, season, episode) => {
            return $http.get(link).then(response => {
                let el = DOM(response.data);
                let frame = el.querySelector('iframe[allowfullscreen][src*="/serial/"]');

                if (!frame)
                    throw new Error('Неизвестная ошибка. Попробуйте позже.');

                return frame.getAttribute('src');
            }).then(url => {
                return Server.send('video', {url, link, season, episode});
            });
        };

        this.loadData = (link) => {
            return $http.get(link).then(response => {
                let data = {other: []};
                let el = DOM(response.data);

                //poster image
                let image = el.querySelector('img[itemprop]');
                data.image = image ? `http://${domain}/${image.getAttribute('src')}` : null;

                //voice
                try {
                    data.voice = el.querySelector('.poster-video').querySelector('strong').querySelector('span').textContent;
                } catch (e) {
                    data.voide = null;
                }

                //description
                try {
                    data.description = el.querySelector('article').textContent;
                } catch (e) {
                    data.description = null;
                }

                let other = el.querySelectorAll('.view-info-title');
                other.forEach(item => {
                    data.other.push({
                        caption: item.textContent,
                        data: item.nextSibling.textContent
                    });
                });

                return data;
            });
        };

        this.loadImage = (link) => {
            return $http.get(link).then(response => {
                let el = DOM(response.data);
                let image = el.querySelector('img[itemprop]');

                return image ? `http://${domain}/${image.getAttribute('src')}` : '';
            });
        };

        this.search = (name) => {
            return Server.send('search', name).then(found => {
                if (typeof found !== 'string')
                    return;

                let serials = [];

                let temp = document.createElement('div');
                temp.innerHTML = found;

                let items = temp.querySelectorAll('a');
                items.forEach(item => {
                    if (!item.childNodes.length)
                        return;

                    let link = item.href;
                    let info = item.childNodes[0].childNodes;

                    if (info.length < 2)
                        return;

                    serials.push({
                        name: info[0].textContent,
                        info: info[1].textContent.replace(/[(|)]/gim, '').trim(),
                        link
                    });
                });

                return serials;
            });
        };
    });