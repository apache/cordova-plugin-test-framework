Cordova Plugin Test Framework
=============================

This plugin attempts to establish a defacto standard for Apache Cordova plugin testing.

How it works
============

The `org.apache.cordova.test-harness` plugin does two things:

1. [Provides an interface to other plugins for defining jasmine-2.0 style auto tests, or custom manual tests](#interface)
2. [Provides a test harness for running all plugin tests on your target device(s)](#harness)

<a name="interface" />
Testing Interface
=================

[`jasmine-2.0`](http://jasmine.github.io/2.0/introduction.html)

<a name="harness" />
Testing Harness
===============

Change the start page of you application, but adding this to your `config.xml`:

```
<content src="cdvtests/index.html" />
```

Now, when you run your app, you will start the test harness instead of your application.  At any point, switch back to application development by removing that line from your `config.xml`.
