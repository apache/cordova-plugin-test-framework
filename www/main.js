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

var autoFirstTime = true;

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
  };
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
    };
  }

  window.console = {
    log: createCustomLogger('log'),
    warn: createCustomLogger('warn'),
    error: createCustomLogger('error'),
  };
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

function setupAutoTestsEnablers(cdvtests) {
  
  var enablerList = createEnablerList();

  // Iterate over all the registered test modules
  Object.keys(cdvtests.tests).forEach(function(api) {
    var testModule = cdvtests.tests[api];
    
    if (!testModule.hasOwnProperty('defineAutoTests'))
      return;
    
    // For "standard" plugins remove the common/repetitive bits of
    // the api key, for use as the title.  For third-party plugins, the full
    // api will be used as the title
    var title = api.replace(/org\.apache\.cordova\./i, '').replace(/\.tests.tests/i, '');

    createEnablerCheckbox(api, title, testModule.getEnabled(), enablerList.id, toggleTestHandler);
  });
}

/******************************************************************************/

function createEnablerList() {
  var buttons = document.getElementById('buttons');

  var enablerContainer = document.createElement('div');
  enablerContainer.id = 'test-enablers-container';
  
  var expander = document.createElement('span');
  expander.id = 'test-expander';
  expander.innerText = 'Show/hide tests to be run';
  expander.onclick = toggleEnablerVisibility;

  var enablerList = document.createElement('div');
  enablerList.id = "test-list";
  
  var checkButtonBar = document.createElement('ul');
  checkButtonBar.classList.add('topcoat-button-bar');
  
  for (var i = 0; i < 2; i++)
  {
    var barItem = document.createElement('li');
    barItem.classList.add('topcoat-button-bar__item');
    
    var link = document.createElement('a');
    var selected = (i === 0);
    link.classList.add('topcoat-button-bar__button');
    link.innerText = selected ? 'Check all' : 'Uncheck all';
    link.href = null;
    link.onclick = (function(select) {
      return function(e) {
        e.preventDefault();
        toggleSelected(enablerList.id, select);
        return false;
      };
    })(selected);

    barItem.appendChild(link);
    checkButtonBar.appendChild(barItem);
  }

  enablerList.appendChild(checkButtonBar);
  
  enablerContainer.appendChild(expander);
  enablerContainer.appendChild(enablerList);
  
  buttons.appendChild(enablerContainer);
  
  return enablerList;
}

/******************************************************************************/

function toggleSelected(containerId, newCheckedValue) {
  var container = document.getElementById(containerId);
  
  var cbs = container.getElementsByTagName('input');
  
  for (var i = 0; i < cbs.length; i++) {
    if(cbs[i].type === 'checkbox') {
      cbs[i].checked = newCheckedValue;
      toggleTestEnabled(cbs[i]);
    }
  }    
}

/******************************************************************************/

function toggleEnablerVisibility() {
  var enablerList = document.getElementById('test-list');
  if (enablerList.classList.contains('expanded')) {
    enablerList.classList.remove('expanded');
  } else {
    enablerList.classList.add('expanded');
  }
}

/******************************************************************************/

function createEnablerCheckbox(api, title, isEnabled, appendTo, callback) {
  var container = document.getElementById(appendTo);

  var label = document.createElement('label');
  label.classList.add('topcoat-checkbox');
  
  var checkbox = document.createElement('input');
  checkbox.type = "checkbox";
  checkbox.value = api;
  checkbox.checked = isEnabled;
  label.htmlFor = checkbox.id = 'enable_' + api;

  checkbox.onchange = function(e) {
    e.preventDefault();
    callback(e);
  };

  var div = document.createElement('div');
  div.classList.add('topcoat-checkbox__checkmark');
  
  var text = document.createElement('span');
  text.innerText = title;
  
  label.appendChild(checkbox);
  label.appendChild(div);
  label.appendChild(text);

  container.appendChild(label);
}

/******************************************************************************/

function toggleTestHandler(event) {
  var checkbox = event.target;
  
  toggleTestEnabled(checkbox);
}

/******************************************************************************/

function toggleTestEnabled(checkbox) {
  var cdvtests = cordova.require('org.apache.cordova.test-framework.cdvtests');
  cdvtests.tests[checkbox.value].setEnabled(checkbox.checked);
}

/******************************************************************************/

function runAutoTests() {
  setTitle('Auto Tests');

  createActionButton('Run', setMode.bind(null, 'auto'));
  createActionButton('Reset App', location.reload.bind(location));
  createActionButton('Back', setMode.bind(null, 'main'));

  var cdvtests = cordova.require('org.apache.cordova.test-framework.cdvtests');
  cdvtests.init();
  setupAutoTestsEnablers(cdvtests);
  
  cdvtests.defineAutoTests();

  // Run the tests!
  var jasmineEnv = window.jasmine.getEnv();
  
  if (autoFirstTime) {
    autoFirstTime = false;
    // Uncomment to skip running of tests on initial load
    //  - If you're testing a specific plugin, you probably want to uncomment,
    //    so you don't have to wait for all the tests to run every time
    //return;
  }
  
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
  };
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
