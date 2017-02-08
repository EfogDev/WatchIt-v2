angular.module('watchit')

    .service('API', function ($http) {
        const {ipcRenderer} = require('electron');

        this.loadData = (link) => {
            return $http.get(link).then(response => {
                let data = {other: []};
                let html = response.data;
                let temp = document.createElement('template');
                temp.innerHTML = html;

                //poster image
                let image = temp.content.querySelector('img[itemprop]');
                data.image = image ? `http://zfilm-hd.net/${image.getAttribute('src')}` : null;

                //voice
                try {
                    data.voice = temp.content.querySelector('.poster-video').querySelector('strong').querySelector('span').textContent;
                } catch (e) {
                    data.voide = null;
                }

                //description
                try {
                    data.description = temp.content.querySelector('article').textContent;
                } catch (e) {
                    data.description = null;
                }

                let other = temp.content.querySelectorAll('.view-info-title');
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
                let html = response.data;
                let temp = document.createElement('template');
                temp.innerHTML = html;

                let image = temp.content.querySelector('img[itemprop]');

                if (!image)
                    return '';

                return `http://zfilm-hd.net/${image.getAttribute('src')}`;
            });
        };

        this.search = (name) => {
            ipcRenderer.send('search', name);

            return new Promise((resolve, reject) => {
                ipcRenderer.once('found', (event, found) => {
                    if (typeof found != 'string')
                        reject();

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

                    resolve(serials);
                });
            });
        };
    });