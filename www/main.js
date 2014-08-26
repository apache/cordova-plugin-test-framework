/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

'use strict';

/******************************************************************************/

function getMode(callback) {
  var mode = localStorage.getItem('cdvtests-mode') || 'main';
  callback(mode);
}

function setMode(mode) {
  var handlers = {
    'main': runMain,
    'auto': runAutoTests,
    'manual': runManualTests
  }
  if (!handlers.hasOwnProperty(mode)) {
    console.error("Unsupported mode: " + mode);
    console.error("Defaulting to 'main'");
    mode = 'main';
  }

  localStorage.setItem('cdvtests-mode', mode);
  clearContent();

  handlers[mode]();
}

/******************************************************************************/

function clearContent() {
  var content = document.getElementById('content');
  content.innerHTML = '';
  var log = document.getElementById('log--content');
  log.innerHTML = '';
  var buttons = document.getElementById('buttons');
  buttons.innerHTML = '';

  setLogVisibility(false);
}

/******************************************************************************/

function setTitle(title) {
  var el = document.getElementById('title');
  el.textContent = title;
}

/******************************************************************************/

function setLogVisibility(visible) {
  if (visible) {
    document.getElementById('log').classList.add('expanded');
  } else {
    document.getElementById('log').classList.remove('expanded');
  }
}

function toggleLogVisibility() {
  var log = document.getElementById('log');
  if (log.classList.contains('expanded')) {
    log.classList.remove('expanded');
  } else {
    log.classList.add('expanded');
  }
}

/******************************************************************************/

function attachEvents() {
  document.getElementById('log--title').addEventListener('click', toggleLogVisibility);
}

/******************************************************************************/

var origConsole = window.console;

exports.wrapConsole = function() {
  function appendToOnscreenLog(type, args) {
    var el = document.getElementById('log--content');
    var div = document.createElement('div');
    div.classList.add('log--content--line');
    div.classList.add('log--content--line--' + type);
    div.textContent = Array.prototype.slice.apply(args).map(function(arg) {
        return (typeof arg === 'string') ? arg : JSON.stringify(arg);
      }).join(' ');
    el.appendChild(div);
    // scroll to bottom
    el.scrollTop = el.scrollHeight;
  }

  function createCustomLogger(type) {
    var medic = require('org.apache.cordova.test-framework.medic');
    return function() {
      origConsole[type].apply(origConsole, arguments);
      // TODO: encode log type somehow for medic logs?
      medic.log.apply(medic, arguments);
      appendToOnscreenLog(type, arguments);
      setLogVisibility(true);
    }
  }

  window.console = {
    log: createCustomLogger('log'),
    warn: createCustomLogger('warn'),
    error: createCustomLogger('error'),
  }
};

exports.unwrapConsole = function() {
  window.console = origConsole;
};

/******************************************************************************/

function createActionButton(title, callback, appendTo) {
  appendTo = appendTo ? appendTo : 'buttons';
  var buttons = document.getElementById(appendTo);
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

/******************************************************************************/
/******************************************************************************/
/******************************************************************************/

function runAutoTests() {
  setTitle('Auto Tests');

  createActionButton('Again', setMode.bind(null, 'auto'));
  createActionButton('Reset App', location.reload.bind(location));
  createActionButton('Back', setMode.bind(null, 'main'));

  var cdvtests = cordova.require('org.apache.cordova.test-framework.cdvtests');
  cdvtests.defineAutoTests();

  // Run the tests!
  var jasmineEnv = window.jasmine.getEnv();
  jasmineEnv.execute();
}

/******************************************************************************/

function runManualTests() {
  setTitle('Manual Tests');

  createActionButton('Reset App', location.reload.bind(location));
  createActionButton('Back', setMode.bind(null, 'main'));

  var contentEl = document.getElementById('content');
  var beforeEach = function(title) {
    clearContent();
    setTitle(title || 'Manual Tests');
    createActionButton('Reset App', location.reload.bind(location));
    createActionButton('Back', setMode.bind(null, 'manual'));
  }
  var cdvtests = cordova.require('org.apache.cordova.test-framework.cdvtests');
  cdvtests.defineManualTests(contentEl, beforeEach, createActionButton);
}

/******************************************************************************/

function runMain() {
  setTitle('Apache Cordova Plugin Tests');

  createActionButton('Auto Tests', setMode.bind(null, 'auto'));
  createActionButton('Manual Tests', setMode.bind(null, 'manual'));
  createActionButton('Reset App', location.reload.bind(location));
  if (/showBack/.exec(location.hash)) {
      createActionButton('Back', function() {
          history.go(-1);
      });
  }
}

/******************************************************************************/

exports.init = function() {
  // TODO: have a way to opt-out of console wrapping in case line numbers are important.
  // ...Or find a custom way to print line numbers using stack or something.
  // make sure to always wrap when using medic.
  attachEvents();
  exports.wrapConsole();

  var medic = require('org.apache.cordova.test-framework.medic');
  medic.load(function() {
    if (medic.enabled) {
      setMode('auto');
    } else {
      getMode(setMode);
    }
  });
};

/******************************************************************************/
