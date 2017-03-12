const http = require('http');
const jsdom = require('jsdom');
const {net} = require('electron');

let getEpisodes = (options, UA) => {
    return new Promise((resolve, reject) => {
        let headers = {
            'Referer': options.link,
            'User-Agent': UA
        };

        let document = jsdom.jsdom('<html />');
        let parsedUrl = document.createElement('a');
        parsedUrl.href = options.url;

        http.get({
            port: 80,
            host: parsedUrl.hostname,
            path: parsedUrl.pathname + `?season=${options.seasonId + 1}`,
            method: 'GET',
            headers
        }, response => {
            let data = '';

            response.on('data', chunk => data += chunk);

            response.on('end', () => {
                let el = document.createElement('div');
                el.innerHTML = data;

                let episodes = [].slice.call(el.querySelector('select[name="episode"]').children).map((node, index) => ({id: index, name: node.innerHTML}));

                resolve(episodes);
            });
        }).on('error', console.error);
    });
};

module.exports = getEpisodes;