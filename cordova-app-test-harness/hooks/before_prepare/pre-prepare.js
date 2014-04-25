#!/bin/bash

if [ -d "plugins/org.apache.cordova.test-framework" ]; then
  exit
fi

mkdir -p plugins platforms

cordova platform add android
cordova platform add ios

cordova plugin add ~/dev/cordova/cordova-labs/cordova-plugin-test-framework
cordova plugin add ~/dev/cordova/cordova-plugin-contacts
cordova plugin add ~/dev/cordova/cordova-plugin-device
cordova plugin add ~/dev/cordova/cordova-plugin-device-motion
cordova plugin add ~/dev/cordova/cordova-plugin-geolocation
