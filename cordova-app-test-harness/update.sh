# Pass an arg like --all to rebuild everything
if [ $# -gt 0 ]; then
  rm -rf platforms
  rm -rf plugins
  mkdir platforms
  cordova platform add android
fi
cordova prepare
date > www/last_update
