angular.module('watchit')

    .service('Server', function () {
         this.send = (eventName, options) => {
             const {ipcRenderer} = require('electron');
             const eventId = ipcRenderer.sendSync(eventName, options);

             return new Promise(resolve => {
                 ipcRenderer.once(eventId, (event, answer) => resolve(answer));
             });
         };
    });