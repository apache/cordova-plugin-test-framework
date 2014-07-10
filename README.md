# Cordova Plugin Test Framework

The `org.apache.cordova.test-harness` plugin does two things:

1. [Defines the interface for cordova plugins to write tests](#interface)
2. [Provides a test harness for actually running those tests](#harness)

Tests run directly inside existing cordova projects, so you can rapidly switch between testing and development.  You can also be sure that your test suite is testing the exact versions of plugins and platforms that your app is using.

# TLDR; Try it

1. Use your existing cordova app, or create a new one.
2. To make this interesting, add some plugins which actually bundle tests.  Here are a few examples:

        cordova plugin add http://git-wip-us.apache.org/repos/asf/cordova-plugin-device.git#cdvtest
        cordova plugin add http://git-wip-us.apache.org/repos/asf/cordova-plugin-device-motion.git#cdvtest
        cordova plugin add http://git-wip-us.apache.org/repos/asf/cordova-plugin-geolocation.git#cdvtest

3. To run plugin tests, install this plugin.

        cordova plugin add http://git-wip-us.apache.org/repos/asf/cordova-labs.git#cdvtest:cordova-plugin-test-framework

4. Change the start page in `config.xml` with `<content src="cdvtests/index.html" />`.
5. Thats it!  Now just `cordova run` and explore.
6. Switch back to application development in-place by removing that line from `config.xml`.


<a name="interface" />
## Writing Plugin Tests

### Where do tests live?

Add a `<js-module>` named `tests` to your `plugin.xml`.  E.g. `org.apache.cordova.device` plugin has this in its [`plugin.xml`](https://github.com/apache/cordova-plugin-device/blob/cdvtest/plugin.xml):

```
<js-module src="test/tests.js" name="tests">
</js-module>
```

The `org.apache.cordova.test-harness` plugin will automatically find all `tests` modules across all plugins.

### Defining Auto Tests

Simply export a function named `defineAutoTests`, which (gasp!) defines your auto-tests when run.  Use the [`jasmine-2.0`](http://jasmine.github.io/2.0/introduction.html) format.  E.g.:

```
exports.defineAutoTests = function() {

  define('awesome tests', function() {
    it('do something sync', function() {
      expect(1).toBe(1);
      ...
    });

    it('do something async', function(done) {
      setTimeout(function() {
        expect(1).toBe(1);
        ...
        done();
      }, 100);
    });
  });

  define('more awesome tests', function() {
    ...
  });

};
```

Note: Your tests will automatically be labeled with your plugin id, so do not prefix your test descriptions.


### Defining Manual Tests

Simply export a function named `defineManualTests`, which (gasp!) defines your manual-tests when run.  Manual tests do *not* use jasmine-2.0, and success/failure results are not officially reported in any standard way.  Instead, create buttons to run arbitraty javascript when clicked, and display output to user using `console` or by manipulating a provided DOM element. E.g.:

```
exports.defineManualTests = function(contentEl, createActionButton) {

  createActionButton('Simple Test', function() {
    console.log(JSON.stringify(foo, null, '\t'));
  });

  createActionButton('Complex Test', function() {
    contentEl.innerHTML = ...;
  });

};
```

Note: Your tests will automatically be labeled with your plugin id, so do not prefix your test descriptions.


<a name="example">
### Example

See: [`org.apache.cordova.device`'s tests](https://github.com/apache/cordova-plugin-device/blob/cdvtest/test/tests.js).


<a name="harness" />
## Running Plugin Tests

1. Use your existing cordova app, or create a new one.
2. Add this plugin:

        cordova plugin add http://git-wip-us.apache.org/repos/asf/cordova-labs.git#cdvtest:cordova-plugin-test-framework

3. Change the start page in `config.xml` with `<content src="cdvtests/index.html" />`.
4. Thats it!  Now just `cordova run` and explore.
5. Switch back to application development in-place by removing that line from `config.xml`.


## FAQ

* Q: Should I add `org.apache.cordova.test-harness` as a `<dependancy>` of my plugin?
  * A: No.  The end-user should decide if they want to install the test harness, not your plugin (most users won't).

* Q: What do I do if my plugin tests must have very large assets?
  * A: Don't bundle those assets with your plugin.  If you can, have your tests fail gracefully if those assets don't don't exist (perhaps log a warning, perhaps fail a single asset-checking test, and skip the rest).  Then, ideally download those assets automatically into local storage the first time tests run.  Or create a manual test step to download and install assets.  As a final alternative, split those test assets into a separate plugin, and instruct users to install that plugin to run your full test suite.

* Q: Should I ship my app with the test harness plugin installed?
  * A: Not likely.  If you want, you can.  Then your app could even embed a link to the test page (`cdvtests/index.html`) from a help section of your app, to give end users a way to run your test suite out in the feild.  That may help diagnose causes of issues within your app.  Maybe.
