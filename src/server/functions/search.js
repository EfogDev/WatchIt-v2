const http = require('http');
const jsdom = require('jsdom');
const {net} = require('electron');

let request;

let search = (name, UA) => {
    return new Promise((resolve, reject) => {
        if (request)
            request.abort();

        request = net.request({
            url: 'http://zfilm-hd.net/engine/ajax/search.php',
            method: 'POST'
        });

        request.setHeader('User-Agent', UA);
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.write(`query=${encodeURI(name)}`);
        request.end();

        request.on('response', response => {
            let data = '';

            response.on('data', chunk => {
                data += chunk;
            });

            response.on('end', () => {
                resolve(data);
            });
        });

        request.on('error', error => {
            reject(error);
        });
    });
};

module.exports = search;