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

exports.tests = Object.create(null);

function getTestsObject(api) {
  return window.tests[api] = window.tests[api] || { enabled: true };
}

// Usage:
// registerAutoTests('apiName', function() {
//   define('foo', function() {
//     .. jasmine tests ..
//   });
// });
exports.registerAutoTests = function(api, fn) {
  var apiTests = getTestsObject(api);
  apiTests.defineAutoTests = function(jasmineInterface) {
    jasmineInterface.describe(api + ' >>', function() {
      fn(jasmineInterface); // Note: don't pass fn directly to jasmine.describe, since describe does async magic if fn takes an arg
    });
  };
};

exports.defineAutoTests = function(jasmineInterface) {
  // one time
  var test_modules = cordova.require('cordova/plugin_list')
    .map(function(jsmodule) {
      return jsmodule.id;
    })
    .filter(function(id) {
      return /.tests$/.test(id);
    });
  test_modules.forEach(function(id) {
    try {
      // This runs the tests
      cordova.require(id);
    } catch(ex) {
      logger('Failed to load:', id);
      return;
    }
    logger('Loaded:', id);
  });

  Object.keys(exports.tests).forEach(function(key) {
    if (!exports.tests[key].enabled)
      return;
    if (!exports.tests[key].hasOwnProperty('defineAutoTests'))
      return;
    exports.tests[key].defineAutoTests(jasmineInterface);
  });
};

// Usage:
// registerManualTests('apiName', function(contentEl, addButton) {
//   .. setup ..
//   addButton('Test Description', function() { ... });
//   addButton('Test 2', function() { ... });
// });
exports.registerManualTests = function(api, fn) {
  var apiTests = getTestsObject(api);
  apiTests.defineManualTests = function(contentEl, addButton) {
    fn(contentEl, addButton);
  };
}

exports.defineManualTests = function(contentEl, beforeEach, createActionButton) {
  Object.keys(exports.tests).forEach(function(key) {
    if (!exports.tests[key].enabled)
      return;
    if (!exports.tests[key].hasOwnProperty('defineManualTests'))
      return;
    createActionButton(key, function() {
      beforeEach();
      exports.tests[key].defineManualTests(contentEl, createActionButton);
    });
  });
};
