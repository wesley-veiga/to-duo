// The iOS 27 SDK refuses to launch apps that don't use the UIScene life cycle, but the
// Expo SDK 57 template still has the AppDelegate own the window. expo@57 already ships
// `ExpoAppSceneDelegate`; this plugin wires it up. Remove it once on a scene-based template.
const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

const SCENE_DELEGATE = `
// Added by plugins/with-scene-lifecycle.js
class SceneDelegate: ExpoAppSceneDelegate {}
`;

function replaceOrThrow(source, search, replacement, what) {
  if (!search.test(source)) {
    throw new Error(`with-scene-lifecycle: couldn't find ${what} in AppDelegate.swift`);
  }
  return source.replace(search, replacement);
}

module.exports = function withSceneLifecycle(config) {
  config = withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };
    return config;
  });

  return withAppDelegate(config, (config) => {
    if (config.modResults.language !== 'swift') {
      throw new Error('with-scene-lifecycle: only Swift AppDelegates are supported');
    }
    let contents = config.modResults.contents;
    if (contents.includes('class SceneDelegate')) return config;

    contents = replaceOrThrow(
      contents,
      /class AppDelegate: ExpoAppDelegate \{/,
      'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {',
      'the AppDelegate class declaration',
    );
    // The scene delegate creates the window and starts React Native into it.
    contents = replaceOrThrow(
      contents,
      /#if os\(iOS\) \|\| os\(tvOS\)\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)[\s\S]*?#endif\n/,
      '',
      'the window setup block',
    );
    config.modResults.contents = contents + SCENE_DELEGATE;
    return config;
  });
};
