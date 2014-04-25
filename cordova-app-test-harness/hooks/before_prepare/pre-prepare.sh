#!/bin/bash

if [ -d "plugins/org.apache.cordova.test-framework" ]; then
  exit
fi

mkdir -p plugins platforms

cordova platform add android
cordova platform add ios

cordova plugin add ~/dev/cordova/cordova-labs/cordova-plugin-test-framework --searchpath ~/dev/cordova/cordova-labs
cordova plugin add ~/dev/cordova/cordova-plugin-contacts --searchpath ~/dev/cordova
cordova plugin add ~/dev/cordova/cordova-plugin-device --searchpath ~/dev/cordova
cordova plugin add ~/dev/cordova/cordova-plugin-device-motion --searchpath ~/dev/cordova
cordova plugin add ~/dev/cordova/cordova-plugin-geolocation --searchpath ~/dev/cordova
