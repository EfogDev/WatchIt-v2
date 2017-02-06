angular.module('watchit')

    .service('API', function ($http) {
        const {ipcRenderer} = require('electron');

        this.loadImage = (link) => {
            return $http.get(link).then(response => {
                let html = response.data;
                let temp = document.createElement('div');
                temp.innerHTML = html;

                let image = temp.querySelector('.poster-video img');

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