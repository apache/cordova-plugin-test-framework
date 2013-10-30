jasmineRequire.CouchDB = function(j$) {
  j$.CouchDBReporter = jasmineRequire.CouchDBReporter(j$);
};

jasmineRequire.CouchDBReporter = function(j$) {
  
  var noopTimer = {
  start: function() {},
  elapsed: function() { return 0; }
  };
  
  function CouchDBReporter(options) {
    var env = options.env || {},
    couch = options.couch || {serverip: 'http://localhost:5900',serverpublic: 'http://localhost:5900',sha: 'test'},
    getContainer = options.getContainer,
    createElement = options.createElement,
    createTextNode = options.createTextNode,
    onRaiseExceptionsClick = options.onRaiseExceptionsClick || function() {},
    timer = options.timer || noopTimer,
    results = [],
    specsExecuted = 0,
    failureCount = 0,
    pendingSpecCount = 0,
    symbols;


    var serverip = couch.serverip,
    serverpublic = couch.serverpublic || serverip,
    sha = couch.sha;
    
    var totalSpecsDefined;
    this.jasmineStarted = function(options) {
      totalSpecsDefined = options.totalSpecsDefined || 0;
      timer.start();
    };
    
    var topResults = new j$.ResultsNode({}, "", null),
    currentParent = topResults;
    
    this.suiteStarted = function(result) {
    };
    
    this.suiteDone = function(result) {

    };
    
    this.specStarted = function(result) {
      // Start timing this spec
    };
    
    var failures = [];
    this.specDone = function(result) {
      if (result.status != "disabled") {
        specsExecuted++;
      }
      if (result.status == "failed") {
        failureCount++;
      }
      if (result.status == "pending") {
        pendingSpecCount++;
      }
    };
    
    this.jasmineDone = function() {
      var p = device.platform.toLowerCase();
      this.postTests({
                     mobilespec:results,
                     sha:this.sha,
                     platform:(platformMap.hasOwnProperty(p) ? platformMap[p] : p),
                     version:device.version.toLowerCase(),
                     timestamp:Math.round(Math.floor((new Date()).getTime() / 1000)),
                     model:device.model || device.name
                     });
      
    };
    

    logresult = function(){
      if(failureCount>0 ) {
        console.log('[[[ TEST OK ]]]');
      } else {
        console.log('[[[ TEST FAILED ]]]');
      }
      logfinished();
    };
    
    var logfinished = function(){
      console.log('>>> DONE <<<');
    };
    
    this.postTests = function(json) {
      console.log('posting tests');
      var doc_id = [  sha, json.version, json.model].map(encodeURIComponent).join('__');
      var doc_url =  serverip + '/mobilespec_results/' + doc_id;
      var publicdoc_url =  serverpublic + '/mobilespec_results/' + doc_id;
      console.log('Test Results URL = '+publicdoc_url+' <<<end test result>>>');

      var xhr = new XMLHttpRequest();
      xhr.open("PUT", doc_url, true);
      xhr.onreadystatechange=function() {
        console.log('onreadystatechange');
        if (xhr.readyState==4) {
          console.log('readystate==4, status: ' + xhr.status);
          if (xhr.status==201) { // HTTP 201 Created the doc successfully
            logresult();
          } else if (xhr.status == 409) { // HTTP 409 Conflict - doc exists already
            console.log('conflict on couch');
            // doc already exists. now let's GET it, grab the rev, delete it, and try again.
            var exehar = new XMLHttpRequest();
            exehar.open('GET', doc_url, true);
            exehar.onreadystatechange=function() {
              if (exehar.readyState==4) {
                if (exehar.status==200) {
                  var existing_doc = JSON.parse(exehar.responseText);
                  var rev = existing_doc._rev;
                  var eksatschargh = new XMLHttpRequest();
                  eksatschargh.open('DELETE', doc_url + '?rev=' + rev, true);
                  eksatschargh.onreadystatechange=function() {
                    if (eksatschargh.readyState==4) {
                      if (eksatschargh.status==200) {
                        var x_h_r = new XMLHttpRequest();
                        x_h_r.open('PUT', doc_url, true);
                        x_h_r.onreadystatechange=function() {
                          if (x_h_r.readyState==4) {
                            if (x_h_r.status==201) {
                              logresult();
                            } else {
                              console.log('the round trip delete+create failed. i give up. status was: ' + x_h_r.status);
                              console.log(x_h_r.responseText);
                            }
                          }
                        };
                        x_h_r.send(JSON.stringify(json));
                      } else {
                        console.log('We tried to add the results to couch. it said it already exists. now im trying to DELETE it. delete failed. status on the DELETE: ' + eksatschargh.status);
                      }
                    }
                  };
                  eksatschargh.send(null);
                } else {
                  console.log('look, we tried to add the results to couch. it said it already exists. now im trying to GET it so i can DELETE it. Get failed. status on the GET: ' + exehar.status);
                }
              }
            };
            exehar.send(null);
          } else {
            console.log('Unexpected couchDB error. status code: ' + xhr.status);
            console.log(xhr.responseText);
            logfinished();
          }
        }
      };
      xhr.send(JSON.stringify(json));
    }
    return this;
  }
  
  /*
postTests: function(json) {
  console.log('posting tests');
  var xhr = new XMLHttpRequest();
  var doc_id = [ this.sha, json.version, json.model].map(encodeURIComponent).join('__');
  // TODO: expose the db in this url for customization
  var doc_url = this.serverip + '/mobilespec_results/' + doc_id;
  var publicdoc_url = this.serverpublic + '/mobilespec_results/' + doc_id;
  console.log('Test Results URL = '+publicdoc_url+' <<<end test result>>>');
  xhr.open("PUT", doc_url, true);
  
  xhr.onreadystatechange=function() {
    console.log('onreadystatechange');
    if (xhr.readyState==4) {
      console.log('readystate==4, status: ' + xhr.status);
      if (xhr.status==201) {
        // HTTP 201 Created
        // we added the doc, hooray
        if(!(jasmine.runnerResults.failed)) {
          console.log('[[[ TEST OK ]]]');
        } else {
          console.log('[[[ TEST FAILED ]]]');
        }
        console.log('>>> DONE <<<');
       } else if (xhr.status == 409) {
        console.log('conflict on couch');
        // HTTP 409 Conflict
        // doc already exists. now let's GET it, grab the rev, delete it, and try again.
        var exehar = new XMLHttpRequest();
        exehar.open('GET', doc_url, true);
        exehar.onreadystatechange=function() {
          if (exehar.readyState==4) {
            if (exehar.status==200) {
              var existing_doc = JSON.parse(exehar.responseText);
              var rev = existing_doc._rev;
              var eksatschargh = new XMLHttpRequest();
              eksatschargh.open('DELETE', doc_url + '?rev=' + rev, true);
              eksatschargh.onreadystatechange=function() {
                if (eksatschargh.readyState==4) {
                  if (eksatschargh.status==200) {
                    var x_h_r = new XMLHttpRequest();
                    x_h_r.open('PUT', doc_url, true);
                    x_h_r.onreadystatechange=function() {
                      if (x_h_r.readyState==4) {
                        if (x_h_r.status==201) {
                          if(!(jasmine.runnerResults.failed)) {
                            console.log('[[[ TEST OK ]]]');
                          } else {
                            console.log('[[[ TEST FAILED ]]]');
                          }
                          console.log('>>> DONE <<<');
                        } else {
                          console.log('the round trip delete+create failed. i give up. status was: ' + x_h_r.status);
                          console.log(x_h_r.responseText);
                        }
                      }
                    };
                    x_h_r.send(JSON.stringify(json));
                  } else {
                    console.log('We tried to add the results to couch. it said it already exists. now im trying to DELETE it. delete failed. status on the DELETE: ' + eksatschargh.status);
                  }
                }
              };
              eksatschargh.send(null);
            } else {
              console.log('look, we tried to add the results to couch. it said it already exists. now im trying to GET it so i can DELETE it. Get failed. status on the GET: ' + exehar.status);
            }
          }
        };
        exehar.send(null);
      } else {
        console.log('Unexpected couchDB error. status code: ' + xhr.status);
        console.log(xhr.responseText);
        console.log('>>> DONE <<<');
      }
    }
  };
  xhr.send(JSON.stringify(json));
}
   */
  
   /**
   * Calculate elapsed time, in Seconds.
   * @param startMs Start time in Milliseconds
   * @param finishMs Finish time in Milliseconds
   * @return Elapsed time in Seconds */
  function elapsedSec (startMs, finishMs) {
    return (finishMs - startMs) / 1000;
  }

  var platformMap = {
    'ipod touch':'ios',
    'iphone':'ios'
  };

  return CouchDBReporter;
};


