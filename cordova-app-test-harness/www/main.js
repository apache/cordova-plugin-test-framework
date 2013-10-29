(function() {

/******************************************************************************/

'use strict';

function getURLParameter(name) {
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

  var jasmine = jasmineRequire.core(jasmineRequire);
  jasmineRequire.html(jasmine);

  var jasmineEnv = jasmine.getEnv();
  var contentEl = document.getElementById('content');
  var test = cordova.require('org.apache.cordova.test-framework.test');
  test.init(jasmine, contentEl, createButton, logger);

  var plugins = cordova.require('cordova/plugin_list')
    .map(function(jsmodule) {
      return jsmodule.id;
    })
    .filter(function(id) {
      return /.tests$/.test(id);
    });

  plugins.forEach(function(id) {
    var tests;
    try {
      tests = cordova.require(id);
      logger('Loaded:', id);
    } catch(ex) {
      logger('Failed to load:', id);
      return;
    }
    tests.init();
  });

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 300;

  var catchingExceptions = getURLParameter("catch");
  jasmineEnv.catchExceptions(typeof catchingExceptions === "undefined" ? true : catchingExceptions);

  var specFilter = new jasmine.HtmlSpecFilter({
    filterString: function() { return getURLParameter("spec"); }
  });

  jasmineEnv.specFilter = function(spec) {
    return specFilter.matches(spec.getFullName());
  };

  var htmlReporter = new jasmine.HtmlReporter({
    env: jasmineEnv,
    queryString: getURLParameter,
    onRaiseExceptionsClick: function() { /*queryString.setParam("catch", !jasmineEnv.catchingExceptions());*/ },
    getContainer: function() { return contentEl; },
    createElement: function() { return document.createElement.apply(document, arguments); },
    createTextNode: function() { return document.createTextNode.apply(document, arguments); },
    timer: new jasmine.Timer()
  });
  htmlReporter.initialize();
  jasmineEnv.addReporter(htmlReporter);

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
