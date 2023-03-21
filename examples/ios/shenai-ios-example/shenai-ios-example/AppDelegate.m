//
//  AppDelegate.m
//  shenai-ios-example
//

#import "AppDelegate.h"
#import <ShenaiSDK/ShenaiView.h>

@interface AppDelegate ()

@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
  ShenaiView *vc = [[ShenaiView alloc] init];
  self.window.rootViewController = vc;
  [self.window makeKeyAndVisible];

  return YES;
}

@end
