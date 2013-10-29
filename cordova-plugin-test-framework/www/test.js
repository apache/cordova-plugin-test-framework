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

/******************************************************************************/

var contentEl,
    createActionButtonFn,
    logFn,
    jasmine,
    jasmineEnv,
    jasmineInterface;

/******************************************************************************/

exports.init = function(jasmine_, contentEl_, createActionButtonFn_, logFn_) {
  jasmine = jasmine_;
  contentEl = contentEl_;
  createActionButtonFn = createActionButtonFn_;
  logFn = logFn_;


  jasmineEnv = jasmine.getEnv();

  jasmineInterface = {
    describe: function(description, specDefinitions) {
      return jasmineEnv.describe(description, specDefinitions);
    },

    xdescribe: function(description, specDefinitions) {
      return jasmineEnv.xdescribe(description, specDefinitions);
    },

    it: function(desc, func) {
      return jasmineEnv.it(desc, func);
    },

    xit: function(desc, func) {
      return jasmineEnv.xit(desc, func);
    },

    beforeEach: function(beforeEachFunction) {
      return jasmineEnv.beforeEach(beforeEachFunction);
    },

    afterEach: function(afterEachFunction) {
      return jasmineEnv.afterEach(afterEachFunction);
    },

    expect: function(actual) {
      return jasmineEnv.expect(actual);
    },

    pending: function() {
      return jasmineEnv.pending();
    },

    addMatchers: function(matchers) {
      return jasmineEnv.addMatchers(matchers);
    },

    spyOn: function(obj, methodName) {
      return jasmineEnv.spyOn(obj, methodName);
    },

    clock: jasmineEnv.clock,

    jsApiReporter: new jasmine.JsApiReporter({
      timer: new jasmine.Timer()
    }),

    jasmine: jasmine,
  };

  jasmineEnv.addReporter(jasmineInterface.jsApiReporter);
}

/******************************************************************************/

exports.runAutoTests = function() {
  jasmineEnv.execute();
}

/******************************************************************************/

// eval this!
exports.injectJasmineInterface = function(target, targetName) {
  var ret = "";
  for (var property in jasmineInterface) {
    target[property] = jasmineInterface[property];
    ret += 'var ' + property + ' = this[\'' + property + '\'];\n';
  }
  return ret;
}

/******************************************************************************/

exports.addManualTest = function(title, handler) {
  createActionButtonFn(title, handler);
}

/******************************************************************************/
