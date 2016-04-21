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

/* global device */

jasmineRequire.medic = function(j$) {
  j$.MedicReporter = jasmineRequire.MedicReporter(j$);
};

jasmineRequire.MedicReporter = function(j$) {
  var noopTimer = {
    start: function() {},
    elapsed: function() { return 0; }
  };

  var platformMap = {
    'ipod touch':'ios',
    'iphone':'ios'
  };

  function MedicReporter(options) {
    var logoptions = options.log || { logurl: 'http://127.0.0.1:5984/' }, // TODO: http://localhost:6800
    timer = options.timer || noopTimer,
    results = [],
    specsExecuted = 0,
    failureCount = 0,
    pendingSpecCount = 0;


    var serverurl = logoptions.logurl;

    this.initialize = function() {
    };

    var totalSpecsDefined;
    this.jasmineStarted = function(options) {
      totalSpecsDefined = options.totalSpecsDefined || 0;
      timer.start();
    };

    this.suiteStarted = function(result) {
    };

    this.suiteDone = function(result) {

    };

    this.specStarted = function(result) {
       console.log('>>>>> Spec started: ' + result.description);
    };

    this.specDone = function(result) {
      if (result.status != "disabled") {
        specsExecuted++;
      }
      if (result.status == "failed") {
        failureCount++;
        results.push(result);
      }
      if (result.status == "pending") {
        pendingSpecCount++;
      }
       console.log('>>>>> Spec completed: ' + result.description);
    };

    var buildResults = function(){
      var json ={specs:specsExecuted, failures:failureCount, results: results};
      return json;
    };

    this.jasmineDone = function() {
      var p = 'Desktop';
      var devmodel='none';
      var version = cordova.version;
      if(typeof device != 'undefined') {
        p = device.platform.toLowerCase();
        devmodel=device.model || device.name;
        version = device.version.toLowerCase();
      }

      this.postTests({
          mobilespec:buildResults(),
          platform:(platformMap.hasOwnProperty(p) ? platformMap[p] : p),
          version:version,
          sha: options.sha,
          timestamp:Math.round(Math.floor((new Date()).getTime() / 1000)),
          model:devmodel
          });

    };

    this.postTests = function(json) {
      console.log('posting tests');

      var xhr = new XMLHttpRequest();
      var doc_id = [options.sha, json.version, json.model].map(encodeURIComponent).join('__');
      var doc_url = serverurl + '/mobilespec_results/' + doc_id;
      xhr.open("PUT", doc_url, true);
      xhr.onload = function (e) {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            console.log("Posting results to CouchDB succeeded: " + xhr.responseText);
          } else {
            console.log("Error posting to CouchDB: " + xhr.statusText);
          }
        }
      };
      xhr.onerror = function (e) {
        console.log("Error posting to CouchDB: " + xhr.statusText);
      };
      xhr.setRequestHeader("Content-Type","application/json");
      xhr.send(JSON.stringify(json));
    };
    return this;
  }

  return MedicReporter;
};
