const {ipcMain, net} = require('electron');
const getUA = require('./user-agents');

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