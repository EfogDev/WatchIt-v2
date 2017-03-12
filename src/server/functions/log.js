const debugState = require('./debug');

module.exports = (message) => {
    if (debugState)
        console.log(message);
};