const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;

const {ipcMain, net} = require('electron');
const getUA = require('./user-agents');
const http = require('http');
const jsdom = require('jsdom');

(() => {
    let request;
    ipcMain.on('search', (event, name) => {
        if (request)
            request.abort();

        request = net.request({
            url: 'http://zfilm-hd.org/engine/ajax/search.php',
            method: 'POST'
        });

        request.setHeader('User-Agent', getUA());
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.write(`query=${encodeURI(name)}`);
        request.end();

        console.log(`query=${encodeURI(name)}`);

        request.on('response', response => { console.log(response);
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
    ipcMain.on('seasons', (event, options) => {
        if (request)
            request.abort();

        let headers = {
            'Referer': options.link,
            'Pragma': 'no-cache',
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

            response.on('data', chunk => data += chunk);

            response.on('end', () => {
                let el = document.createElement('div');
                el.innerHTML = data;

                let seasons = [].slice.call(el.querySelector('select[name="season"]').children).map((node, index) => ({id: index, name: node.innerHTML}));

                event.sender.send('seasons', seasons);
            });
        });
    });
})();

(() => {
    let UA = getUA();
    let request;
    ipcMain.on('episodes', (event, options) => {
        if (request)
            request.abort();

        let headers = {
            'Referer': options.link,
            'Pragma': 'no-cache',
            'User-Agent': UA
        };

        let document = jsdom.jsdom('<html />');
        let parsedUrl = document.createElement('a');
        parsedUrl.href = options.url;

        request = http.get({
            port: 80,
            host: parsedUrl.hostname,
            path: parsedUrl.pathname + `?season=${options.seasonId + 1}&episode=1`,
            method: 'GET',
            headers
        }, response => {
            let data = '';

            response.on('data', chunk => data += chunk);

            response.on('end', () => {
                let el = document.createElement('div');
                el.innerHTML = data;

                let episodes = [].slice.call(el.querySelector('select[name="episode"]').children).map((node, index) => ({id: index, name: node.innerHTML}));

                event.sender.send('episodes', episodes);
            });
        });
    });
})();

(() => {
    let UA = getUA();
    ipcMain.on('video', (event, options) => {
        let m3u8Parse = (data) => {
            var lines = data.split(/(\r\n|\n|\r)/);
            var quality = {};

            lines.forEach((line, index) => {
                if (/RESOLUTION/.test(line)) {
                    var keyVal = line.split(/RESOLUTION=/)[1],
                        val = keyVal.split(',')[0];

                    quality[val.split('x')[1]] = lines[index + 2];
                }
            });

            return quality;
        };

        let tempWindow = new BrowserWindow({
            webPreferences: {nodeIntegration: false},
            show: false
        });

        let injector = `
            new Promise(function (resolve, reject) {
                resolve(document.body.innerHTML.match(/video_token: '(.*?)',/im)[1]);
                showVideo();
            })
        `;

        tempWindow.webContents.on('did-finish-load', () => {
            tempWindow.webContents.executeJavaScript(injector, false, token => {
                let url = `http://s1.yallaneliera.com/video/${token}/index.m3u8?arg=5`;

                request = net.request({
                    method: 'GET',
                    url
                });

                request.setHeader('User-Agent', UA);
                request.end();

                request.on('response', response => {
                    let data = '';

                    response.on('data', chunk => {
                        data += chunk;
                    });

                    response.on('end', () => {
                        let quality = m3u8Parse(data);

                        event.sender.send('video', quality);
                    });
                });
            });
        });

        tempWindow.on('closed', () => {
            tempWindow = null;
        });

        tempWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
            details.requestHeaders['User-Agent'] = UA;

            callback({ cancel: false, requestHeaders: details.requestHeaders });
        });

        tempWindow.webContents.openDevTools();
        tempWindow.loadURL(options.url + `?season=${++options.season}&episode=${++options.episode}`, {extraHeaders: `Referer: ${options.link}\n`});
    });
})();