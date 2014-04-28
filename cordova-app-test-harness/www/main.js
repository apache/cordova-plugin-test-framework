(function() {

'use strict';

/******************************************************************************/

function getMode(callback) {
  var mode = localStorage.getItem('mode') || 'main';
  console.log(mode);
  callback(mode);
}

function setMode(mode) {
  var handlers = {
    'main': runMain,
    'auto': runAutoTests,
    'manual': runManualTests
  }
  if (!handlers.hasOwnProperty(mode)) {
    return console.error("Unsopported mode: " + mode);
  }

  localStorage.setItem('mode', mode);
  window.clearContent();

  handlers[mode]();
}

/******************************************************************************/

window.clearContent = function() {
  var content = document.getElementById('content');
  content.innerHTML = '';
  var log = document.getElementById('log--content');
  log.innerHTML = '';
  var buttons = document.getElementById('buttons');
  buttons.innerHTML = '';
}

window.setTitle = function(title) {
  var el = document.getElementById('title');
  el.textContent = title;
}

window.createActionButton = function(title, callback) {
  var buttons = document.getElementById('buttons');
  var div = document.createElement('div');
  var button = document.createElement('a');
  button.textContent = title;
  button.onclick = function(e) {
    e.preventDefault();
    callback();
  };
  button.classList.add('topcoat-button');
  div.appendChild(button);
  buttons.appendChild(div);
}

// TODO: make a better logger
window.logger = function() {
  console.log.apply(console, arguments);
  window.medic.log.apply(window.medic.log, arguments);

  var el = document.getElementById('log--content');
  var div = document.createElement('div');
  div.classList.add('log--content--line');
  div.textContent = Array.prototype.slice.apply(arguments).map(function(arg) {
      return (typeof arg === 'string') ? arg : JSON.stringify(arg);
    }).join(' ');
  el.appendChild(div);
  // scroll to bottom
  el.scrollTop = el.scrollHeight;
}

/******************************************************************************/

function runAutoTests() {
  setTitle('Auto Tests');

  createActionButton('Again', setMode.bind(null, 'auto'));
  createActionButton('Reset App', location.reload.bind(location));
  createActionButton('Back', setMode.bind(null, 'main'));

  var jasmineInterface = window.setUpJasmine();
  // Attach jasmineInterface to global object
  for (var property in jasmineInterface) {
    window[property] = jasmineInterface[property];
  }
  var cdvtest = cordova.require('org.apache.cordova.test-framework.test');
  cdvtest.defineAutoTests(jasmineInterface);

  // Run the tests!
  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.execute();
}

/******************************************************************************/

function runManualTests() {
  setTitle('Manual Tests');

  createActionButton('Reset App', location.reload.bind(location));
  createActionButton('Back', setMode.bind(null, 'main'));

  var contentEl = document.getElementById('content');
  var beforeEach = function() {
    window.clearContent();
    createActionButton('Reset App', location.reload.bind(location));
    createActionButton('Back', setMode.bind(null, 'manual'));
  }
  var cdvtest = cordova.require('org.apache.cordova.test-framework.test');
  cdvtest.defineManualTests(contentEl, beforeEach, createActionButton);
}

/******************************************************************************/

function runMain() {
  setTitle('Cordova Tests');

  createActionButton('Auto Tests', setMode.bind(null, 'auto'));
  createActionButton('Manual Tests', setMode.bind(null, 'manual'));
  createActionButton('Reset App', location.reload.bind(location));
}

/******************************************************************************/

function startAutoReload() {
  var last_update = null;
  setInterval(function() {
    $.get('last_update', function(time) {
      if (!last_update) {
        last_update = time;
        return;
      } else if (last_update === time) {
        return;
      } else {
        location.reload();
      }
    });
  }, 250);
}

/******************************************************************************/

document.addEventListener("deviceready", function() {
  startAutoReload();
  window.medic.load(function() {
    if (window.medic.enabled) {
      setMode('auto');
    } else {
      getMode(setMode);
    }
  });
});

/******************************************************************************/

}());
