//
//  main.m
//  shenai-ios-example
//

#import "AppDelegate.h"
#import <ShenaiSDK/ShenaiSDK.h>
#import <UIKit/UIKit.h>

int main(int argc, char *argv[]) {
  NSString *appDelegateClassName;
  @autoreleasepool {
    // Setup code that might create autoreleased objects goes here.
    appDelegateClassName = NSStringFromClass([AppDelegate class]);
  }

  NSString *apiKey = @"YOUR_API_KEY";

  InitializationResult result = [ShenaiSDK initialize:apiKey
                                               userID:nil
                                             settings:nil];

  switch (result) {
  case InitializationResultSuccess:
    NSLog(@"Initialization succeeded");
    break;
  case InitializationResultFailureInvalidApiKey:
    NSLog(@"Initialization failed: Invalid API key");
    break;
  case InitializationResultFailureConnectionError:
    NSLog(@"Initialization failed: Connection error");
    break;
  case InitializationResultFailureInternalError:
    NSLog(@"Initialization failed: Internal error");
    break;
  default:
    NSLog(@"Initialization failed: Unknown error");
    break;
  }

  return UIApplicationMain(argc, argv, nil, appDelegateClassName);
}
