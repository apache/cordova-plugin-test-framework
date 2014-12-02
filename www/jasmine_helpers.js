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

exports.setUpJasmine = function() {
    // Set up jasmine
    var jasmine = jasmineRequire.core(jasmineRequire);
    jasmineRequire.html(jasmine);
    var jasmineEnv = jasmine.currentEnv_ = new jasmine.Env();

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
    jasmineEnv.catchExceptions(false);

    // Set up jasmine interface
    var jasmineInterface = Object.create(null);
    jasmineInterface.jasmine = jasmine;

    // Fill in jasmineInterface with built-ins
    var jasmine_env_functions = ['describe',
                                 'xdescribe',
                                 'it',
                                 'xit',
                                 'beforeEach',
                                 'afterEach',
                                 'expect',
                                 'pending',
                                 'spyOn',
                                 'addCustomEqualityTester',
                                 'addMatchers'];

    jasmine_env_functions.forEach(function(fn) {
    jasmineInterface[fn] = jasmineEnv[fn].bind(jasmineEnv);
    });
    jasmineInterface.clock = jasmineEnv.clock;

    // Add Reporters
    addJasmineReporters(jasmineInterface, jasmineEnv);

    // Add Spec Filter
    jasmineEnv.specFilter = function(spec) {
    //console.log(spec.getFullName());
    return true;
    };

    return jasmineInterface;
}

function addJasmineReporters(jasmineInterface, jasmineEnv) {
    jasmineInterface.jsApiReporter = new jasmineInterface.jasmine.JsApiReporter({ timer: new jasmineInterface.jasmine.Timer() });
    jasmineEnv.addReporter(jasmineInterface.jsApiReporter);

    jasmineInterface.htmlReporter = new jasmineInterface.jasmine.HtmlReporter({
        env: jasmineEnv,
        queryString: function() { return null; },
        onRaiseExceptionsClick: function() { },
        getContainer: function() { return document.getElementById('content'); },
        createElement: function() { return document.createElement.apply(document, arguments); },
        createTextNode: function() { return document.createTextNode.apply(document, arguments); },
        timer: new jasmineInterface.jasmine.Timer()
    });
    jasmineInterface.htmlReporter.initialize();
    jasmineEnv.addReporter(jasmineInterface.htmlReporter);

    var medic = require('org.apache.cordova.test-framework.medic');

    if (medic.enabled) {
        jasmineRequire.medic(jasmineInterface.jasmine);
        jasmineInterface.MedicReporter = new jasmineInterface.jasmine.MedicReporter({
            env: jasmineEnv,
            log: { logurl: medic.logurl },
            sha: medic.sha
        });
        jasmineInterface.MedicReporter.initialize();
        jasmineEnv.addReporter(jasmineInterface.MedicReporter);
    }
    
}
