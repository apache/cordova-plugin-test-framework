//
//  AppSettings.m
//  

#import "AppSettings.h"

@implementation AppSettings

- (void)get:(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* result = nil;

    NSArray* options = command.arguments;

    if (!options) {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"no setting keys"];
        [self.commandDelegate sendPluginResult:result callbackId:[command callbackId]];
        return;
    }

    @try {
        NSMutableDictionary *settings = [[NSMutableDictionary alloc] initWithCapacity:20];
      
      
        NSDictionary *sets = self.commandDelegate.settings;
        for (NSString* settingName in options) {
          if(sets[ [settingName lowercaseString]] != nil) {
             settings[[settingName lowercaseString ]] = sets[ [settingName lowercaseString]];
          }
        }
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary: [settings copy]];
    } @catch (NSException * e) {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT messageAsString:[e reason]];
    } @finally {
        [self.commandDelegate sendPluginResult:result callbackId:[command callbackId]];
    }
}

@end
