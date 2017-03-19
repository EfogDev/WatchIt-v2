const http = require('http');
const jsdom = require('jsdom');

let getSeasons = (options, UA) => {
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
            path: parsedUrl.pathname,
            method: 'GET',
            headers
        }, response => {
            let data = '';

            response.on('data', chunk => data += chunk);

            response.on('end', () => {
                let el = document.createElement('div');
                el.innerHTML = data;

                let seasons = [].slice.call(el.querySelector('select[name="season"]').children).map((node, index) => ({id: index, name: node.innerHTML}));

                resolve(seasons);
            });
        }).on('error', console.error);
    });
};

module.exports = getSeasons;