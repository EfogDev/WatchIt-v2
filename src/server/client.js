const {ipcMain} = require('electron');
const log = require('./functions/log');
const debugState = require('./functions/debug');

let mask = '__CUSTOM_EVENT_{eventId}';
let eventId = 0;

let genereteEventId = () => {
    return mask.replace('{eventId}', eventId++);
};

let on = (eventName, cb) => {
    ipcMain.on(eventName, (event, options) => {
        let customEventId = genereteEventId();
        let result = cb(options);

        event.returnValue = customEventId;

        let callback = (result) => {
            log(`Answering to event "${eventName}".\r\n Custom event ID is ${customEventId}.\r\n`);

            event.sender.send(customEventId, result);
        };

        if (typeof result.then !== 'function') {
            callback(result);
        } else {
            result.then(result => callback(result));
        }
    });
};

module.exports = {on};