//
//  main.m
//  shenai-ios-example
//

#import "AppDelegate.h"
#include <ShenaiSDK/shenai_api_cpp.h>
#import <UIKit/UIKit.h>

int main(int argc, char *argv[]) {
  NSString *appDelegateClassName;
  @autoreleasepool {
    // Setup code that might create autoreleased objects goes here.
    appDelegateClassName = NSStringFromClass([AppDelegate class]);
  }

  std::string API_KEY = "YOUR_API_KEY";
  std::string USER_ID = "";

  auto init_result = shen::Initialize(API_KEY, USER_ID);

  return UIApplicationMain(argc, argv, nil, appDelegateClassName);
}
