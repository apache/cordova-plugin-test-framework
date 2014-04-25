# Pass an arg like --all to rebuild everything
if [ $# -gt 0 -o ! -d platforms -o ! -d plugins ]; then
  rm -rf platforms
  rm -rf plugins
  mkdir platforms
  cordova platform add android
fi
cordova prepare
date > www/last_update
