
var argscheck = require('cordova/argscheck'),
    exec = require('cordova/exec');

function AppSettings() {

}
/**
 * Get a config.xml settings (preference) value
 *
 * @param {Function} successCallback The function to call when the value is available
 * @param {Function} errorCallback The function to call when value is unavailable
 * @param {String} key Key
 */
AppSettings.prototype.get = function (successCallback, errorCallback, keyArray) {
    argscheck.checkArgs('fFa', 'AppSettings.get', arguments);

    exec (successCallback, errorCallback, "AppSettings", "get", keyArray);
};

module.exports = new AppSettings();

