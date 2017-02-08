const {ipcMain, net} = require('electron');
const getUA = require('./user-agents');
const http = require('http');
const jsdom = require('jsdom');
const zlib = require("zlib");

(() => {
    let request;
    ipcMain.on('search', (event, name) => {
        if (request)
            request.abort();

        request = net.request({
            url: 'http://zfilm-hd.net/engine/ajax/search.php',
            method: 'POST'
        });

        request.setHeader('User-Agent', getUA());
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.write(`query=${encodeURI(name)}`);
        request.end();

        request.on('response', response => {
            let data = '';

            response.on('data', chunk => {
                data += chunk;
            });

            response.on('end', () => {
                event.sender.send('found', data);
            });
        });

        request.on('error', error => {
            event.sender.send('found', error);
        });
    });
})();

(() => {
    ipcMain.on('debug', (event) => {
        event.sender.send('debug', process.env.DEBUG);
    });
})();

(() => {
    let UA = getUA();
    let request;
    ipcMain.on('iframe', (event, options) => {
        if (request)
            request.abort();

        let headers = {
            'Referer': options.link,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, sdch',
            'Accept-Language': 'ru,en;q=0.8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'DNT': '1',
            'Host': 's1.yallaneliera.com',
            'Pragma': 'no-cache',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': UA
        };

        let document = jsdom.jsdom('<html />');
        let parsedUrl = document.createElement('a');
        parsedUrl.href = options.url;

        request = http.get({
            port: 80,
            host: parsedUrl.hostname,
            path: parsedUrl.pathname,
            method: 'GET',
            headers
        }, response => {
            let data = '';
            let gzip = zlib.createGunzip();
            response.pipe(gzip);

            gzip.on('data', chunk => {
                data += chunk;
            });

            gzip.on('end', () => {
                let options = {
                    'debug=false': true, //yeah, lol
                    'ad_attr': 0,
                    'varb1': data.match(/var varb1 = '(.+?)'/im)[1]
                };

                let match = data.replace(/(\r|\n|\r\n)/gim, '').match(/var session_params = {(.*?)}/im);
                let params = match[1];
                let strings = params.match(/(.+?): (.+?),/gim);
                strings.forEach(s => {
                     let parsed = s.match(/(.+?): '?(.+?)'?,/im);
                     if (parsed[1].trim() === 'ad_attr')
                         return;

                     options[parsed[1].trim()] = parsed[2];
                });

                getPlaylist(parsedUrl, options, data.match(/<meta name="csrf-token" content="(.+?)"/im)[1]).then(data => {
                    event.sender.send('iframe', data);
                });
            });

            gzip.on('error', error => {
                event.sender.send('iframe', error);
            });
        });
    });

    let getPlaylist = (url, options, csrf) => {
        return new Promise((resolve, reject) => {
            let headers = {
                'Referer': `http://${url.hostname}/sessions/new_session`,
                'User-Agent': UA,
                'X-CSRF-Token': csrf,
                'X-Var-Document': 'String'
            };

            let request = http.request({
                port: 80,
                host: url.hostname,
                path: '/sessions/new_session',
                method: 'POST',
                headers
            }, response => {
                let data = '';

                response.on('data', chunk => {
                    data += chunk;
                });

                response.on('end', () => {
                    resolve('END! ' + data);
                });
            });

            console.log(headers);
            console.log(Object.keys(options).reduce((str, opt) => str + '&' + opt + '=' + options[opt]));
            request.write(Object.keys(options).reduce((str, opt) => str + '&' + opt + '=' + options[opt]));
            request.end();
        });
    };
})();