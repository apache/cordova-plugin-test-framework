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
  return exports.tests[api] = exports.tests[api] || { enabled: true };
}

exports.init = function() {
  // This finds all js-modules named "tests" regadless of plugin it came from
  var test_modules = cordova.require('cordova/plugin_list')
    .map(function(jsmodule) {
      return jsmodule.id;
    })
    .filter(function(id) {
      return /.tests$/.test(id);
    });

  // Map auto / manual test definitions for each, but without actually running the handlers
  test_modules.forEach(function(id) {
    try {
      var plugintests = cordova.require(id);

      if (plugintests.hasOwnProperty('defineAutoTests')) {
        getTestsObject(id).defineAutoTests = function(jasmineInterface) {
          jasmineInterface.describe(id + ' >>', plugintests.defineAutoTests.bind(plugintests));
        };
      }

      if (plugintests.hasOwnProperty('defineManualTests')) {
        getTestsObject(id).defineManualTests = plugintests.defineManualTests.bind(plugintests);
      }
    } catch(ex) {
      console.warn('Failed to load tests: ', id);
      return;
    }
  });
}

exports.defineAutoTests = function(jasmineInterface) {
  exports.init();
  Object.keys(exports.tests).forEach(function(key) {
    if (!exports.tests[key].enabled)
      return;
    if (!exports.tests[key].hasOwnProperty('defineAutoTests'))
      return;
    exports.tests[key].defineAutoTests(jasmineInterface);
  });
};

exports.defineManualTests = function(contentEl, beforeEach, createActionButton) {
  exports.init();
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
