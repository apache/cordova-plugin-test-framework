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

// TODO: re-add medic

/******************************************************************************/

function getMode(callback) {
  var mode = localStorage.getItem('cdvtest-mode') || 'main';
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

  localStorage.setItem('cdvtest-mode', mode);
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
}

function setTitle(title) {
  var el = document.getElementById('title');
  el.textContent = title;
}

function setLogVisibility(visible) {
  if (visible) {
    document.getElementById('log').classList.add('expanded');
  } else {
    document.getElementById('log').classList.remove('expanded');
  }
}

function createActionButton(title, callback) {
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
function logger() {
  console.log.apply(console, arguments);
  //window.medic.log.apply(window.medic.log, arguments);

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
  setLogVisibility(true);

  createActionButton('Again', setMode.bind(null, 'auto'));
  createActionButton('Reset App', location.reload.bind(location));
  createActionButton('Back', setMode.bind(null, 'main'));

  var cdvtest = cordova.require('org.apache.cordova.test-framework.test');
  cdvtest.defineAutoTests();

  // Run the tests!
  var jasmineEnv = window.jasmine.getEnv();
  jasmineEnv.execute();
}

/******************************************************************************/

function runManualTests() {
  setTitle('Manual Tests');
  setLogVisibility(true);

  createActionButton('Reset App', location.reload.bind(location));
  createActionButton('Back', setMode.bind(null, 'main'));

  var contentEl = document.getElementById('content');
  var beforeEach = function() {
    clearContent();
    createActionButton('Reset App', location.reload.bind(location));
    createActionButton('Back', setMode.bind(null, 'manual'));
  }
  var cdvtest = cordova.require('org.apache.cordova.test-framework.test');
  cdvtest.defineManualTests(contentEl, beforeEach, createActionButton);
}

/******************************************************************************/

function runMain() {
  setTitle('Cordova Tests');
  setLogVisibility(false);

  createActionButton('Auto Tests', setMode.bind(null, 'auto'));
  createActionButton('Manual Tests', setMode.bind(null, 'manual'));
  createActionButton('Reset App', location.reload.bind(location));
}

/******************************************************************************/

exports.init = function() {
  /*
  window.medic.load(function() {
    if (window.medic.enabled) {
      setMode('auto');
    } else {
    }
  });
  */
  getMode(setMode);
};

/******************************************************************************/
