const util = require('util');
const {ipcMain} = require('electron');
const UA = require('./user-agents')();
const log = require('./functions/log');

const client = require('./client');

const debugState = require('./functions/debug');
const search = require('./functions/search');
const getSeasons = require('./functions/seasons');
const getEpisodes = require('./functions/episodes');
const getVideoLinks = require('./functions/video');

client.on('debug', () => {
    return debugState;
});

client.on('search', name => {
    return search(name, UA).catch(error => console.error);
});

client.on('seasons', options => {
    return getSeasons(options, UA).catch(err => console.error);
});

client.on('episodes', options => {
    return getEpisodes(options, UA).catch(err => console.error);
});

client.on('video', options => {
    return getVideoLinks(options, UA).catch(err => console.error);
});

if (debugState === true) {
    const emit = ipcMain.emit;

    ipcMain.emit = function() {
        emit.apply(ipcMain, arguments);

        log(`Event "${arguments[0]}" has been thrown.\r\n Options: ${util.inspect(arguments[2])}\r\n`);
    };
}