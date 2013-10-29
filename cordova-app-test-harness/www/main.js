(function() {

/******************************************************************************/

'use strict';

function getURLParameter(name) {
  /*var queryString = new jasmine.QueryString({
    getWindowLocation: function() { return window.location; }
  });
  return queryString.getParam(name);*/
  return decodeURIComponent(
      (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [,""])[1].replace(/\+/g, '%20')
    ) || null;
}

function getMode() {
  return getURLParameter('mode') || 'main';
}

function setTitle(title) {
  var el = document.getElementById('title');
  el.textContent = title;
}

function createButton(title, callback) {
  var content = document.getElementById('content');
  var div = document.createElement('div');
  var button = document.createElement('a');
  button.textContent = title;
  button.onclick = function(e) {
    e.preventDefault();
    callback();
  };
  button.classList.add('topcoat-button');
  div.appendChild(button);
  content.appendChild(div);
}

function logger() {
  console.log.apply(console, Array.prototype.slice.apply(arguments));
  var el = document.getElementById('log');
  var div = document.createElement('div');
  div.textContent = Array.prototype.slice.apply(arguments).map(function(arg) {
      return (typeof arg === 'string') ? arg : JSON.stringify(arg);
    }).join(' ');
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

/******************************************************************************/

function runMain() {
  setTitle('Cordova Tests');
  createButton('Auto Tests', function() { location.href = 'index.html?mode=autotests'; });
  createButton('Manual Tests', function() { location.href = 'index.html?mode=manualtests'; });

  setDeviceInfo();
}

function setDeviceInfo() {
  var el = document.getElementById('content');
  function display() {
    var div = document.createElement('div');
    div.textContent = Array.prototype.slice.apply(arguments).map(function(arg) {
        return (typeof arg === 'string') ? arg : JSON.stringify(arg);
      }).join(' ');
    el.appendChild(div);
  }
  display("Platform: ", device.platform);
  display("Version: ", device.version);
  display("Uuid: ", device.uuid);
  display("Model: ", device.model);
  display("Width: ", screen.width);
  display("Height: ", screen.height);
  display("Color-Depth: ", screen.colorDepth);
  display("User-Agent: ", navigator.userAgent);
}

/******************************************************************************/

function runAutoTests() {
  setTitle('Auto Tests');
  createButton('Back', function() { location.href = 'index.html'; });

  // TODO: get all installed plugins
  var plugins = [
      'org.apache.cordova.device',
      'org.apache.cordova.device-motion',
      'org.chromium.storage'
    ];

  plugins.forEach(function(id) {
    var tests;
    try {
      tests = cordova.require(id + '.tests');
    } catch(ex) {
      logger('Failed to load tests: ' + id);
      return;
    }
    tests.init();
  });

  var test = cordova.require('org.apache.cordova.test-framework.test');
  test.runAutoTests();
}

/******************************************************************************/

function runManualTests() {
  setTitle('Manual Tests');
  createButton('Back', function() { location.href = 'index.html'; });
}

/******************************************************************************/

function runUnknownMode() {
  setTitle('Unknown Mode');
  createButton('Reset', function() { location.href = 'index.html'; });
}

/******************************************************************************/

function loaded() {
}

function ready() {
  var test = cordova.require('org.apache.cordova.test-framework.test');
  test.init(document.getElementById('content'), createButton, logger);

  var mode = getMode();
  logger(mode);
  if (mode === 'main')
    runMain();
  else if (mode === 'autotests')
    runAutoTests();
  else if (mode === 'manualtests')
    runManualTests();
  else
    runUnknownMode();
}

document.addEventListener("DOMContentLoaded", loaded);
document.addEventListener("deviceready", ready);

/******************************************************************************/

}());
