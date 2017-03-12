const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const http = require('http');
const jsdom = require('jsdom');
const {net} = require('electron');

let request;

let getVideoLinks = (options, UA) => {
    return new Promise((resolve, reject) => {
        if (request)
            request.abort();

        let m3u8Parse = (data) => {
            let lines = data.split(/(\r\n|\n|\r)/);
            let quality = {};

            lines.forEach((line, index) => {
                if (/RESOLUTION/.test(line)) {
                    let keyVal = line.split(/RESOLUTION=/)[1],
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
                const send = XMLHttpRequest.prototype.send;
                const callbackName = 'callback' + Math.floor(Math.random() * 3141592);

                window[callbackName] = function(xhr) {
                    let response = JSON.parse(xhr.responseText);
                    let result = response.mans.manifest_m3u8;

                    return result;
                };

                XMLHttpRequest.prototype.send = function () {
                    this.onload = function () {
                        let m3u8 = window[callbackName](this);

                        resolve(m3u8);
                    };

                    send.apply(this, arguments);
                };  

                showVideo();
            });
        `;

        tempWindow.webContents.on('did-finish-load', () => {
            tempWindow.webContents.executeJavaScript(injector, false, result => {
                tempWindow.close();
                let url = result;

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

                        resolve(quality);
                    });
                });
            });
        });

        tempWindow.on('closed', () => {
            tempWindow = null;
        });

        tempWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
            details.requestHeaders['User-Agent'] = UA;

            callback({cancel: false, requestHeaders: details.requestHeaders});
        });

        tempWindow.loadURL(options.url + `?season=${++options.season}&episode=${++options.episode}`, {extraHeaders: `Referer: ${options.link}\n`});
    });
};

module.exports = getVideoLinks;