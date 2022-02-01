# yarn workspacesを使ったReactNativeモノレポ構成構築メモ

以下やったことです。

## ルートディレクトリを作る

```bash
mkdir yarn-workspaces
cd yarn-workspaces
yarn init -y
```

package.json に以下を追加します。

```
"private": true,
"workspaces": [
  "packages/*"
],
```

## packagesディレクトリを作る

```bash
mkdir packages
cd packages
```

## Reactのpackageを作る

JavaScript と TypeScript の2種類のプロジェクトを用意します。

```bash
npx create-react-app react-app-js
npx create-react-app react-app-ts --template typescript
```

## APIサーバーを作る

```bash
mkdir api-server
cd api-server
yarn init -y
```

```bash
yarn workspace api-server add @types/express @types/node express ts-node typescript
```

TODO: このサーバーは後で使えるようにする

## ドメイン的な場所を作る

```bash
mkdir domain
cd domain
```

TypeScript の型ファイルを作成します。

```bash
mkdir types
touch user.ts
```

user.ts

```typescript
export type UserType = {
  id: number;
  name: string;
};
```

```bash
mkdir functions
touch getUser.ts
```

getUser.ts

```typescript
import type { UserType } from '../types/user';

export const getUser = (): UserType => {
  return {
    id: 1,
    name: 'hisasann',
  };
};
```

## ReactNativeのプロジェクトを作成する

```bash
cd packages
npx react-native init AwesomeTSProject --template react-native-template-typescript
```

via: [Setting up the development environment · React Native](https://reactnative.dev/docs/environment-setup)

以下のエラーが出ました。


```bash
✔ Downloading template
✔ Copying template
✔ Processing template
✖ Installing CocoaPods dependencies (this may take a few minutes)
✖ Installing CocoaPods dependencies (this may take a few minutes)
error Error: Failed to install CocoaPods dependencies for iOS project, which is required by this template.
Please try again manually: "cd ./AwesomeTSProject/ios && pod install".
CocoaPods documentation: https://cocoapods.org/
```

```bash
cd ./AwesomeTSProject/ios && pod install
```

を実行してみたら、

```bash
[!] Invalid `Podfile` file: cannot load such file -- /Users/user/yarn-workspaces/packages/AwesomeTSProject/node_modules/react-native/scripts/react_native_pods.

 #  from /Users/user/yarn-workspaces/packages/AwesomeTSProject/ios/Podfile:1
 #  -------------------------------------------
 >  require_relative '../node_modules/react-native/scripts/react_native_pods'
 #  require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'
 #  -------------------------------------------
```

とさらにエラーが出ました。

`yarn workspace` を使っているので、 React Native が hoisting され、 root の node_modules 配下に存在しているため、 Podfile から React Native が参照できていないのが原因です。

### ios

'../node_modules' -> '../../../node_modules'

Podfile を以下のようにパスを変更します。

`packages/AwesomeTSProject/ios/Podfile`

```
require_relative '../../../node_modules/react-native/scripts/react_native_pods'
require_relative '../../../node_modules/@react-native-community/cli-platform-ios/native_modules'
```

`packages/AwesomeTSProject/ios/AwesomeTSProject.xcodeproj/project.pbxproj`

```
shellScript = "set -e\n\nexport NODE_BINARY=node\n../../../node_modules/react-native/scripts/react-native-xcode.sh\n";
```

など、全部で3箇所ありました。

これで `pod install` が動くようになると思います。

`yarn start` と `yarn ios` で以下のようなエラーが出ました。

```
error: Error: Unable to resolve module react-native from /Users/user/yarn-workspaces/packages/AwesomeTSProject/index.js: react-native could not be found within the project or in these directories:
  node_modules
  ../../node_modules

If you are sure the module exists, try these steps:
 1. Clear watchman watches: watchman watch-del-all
 2. Delete node_modules and run yarn install
 3. Reset Metro's cache: yarn start --reset-cache
 4. Remove the cache: rm -rf /tmp/metro-*
  3 |  */
  4 |
> 5 | import {AppRegistry} from 'react-native';
```

`metro.config.js` を root に置き、

```js
const watchFolders = [path.resolve(__dirname, "node_modules")];
```

を追記する必要がありました。

### android

この時点だと、 AndroidStudio を起動すると、以下のようなエラーが表示されました。

```
Settings file '/Users/user/yarn-workspaces/packages/AwesomeTSProject/android/settings.gradle' line: 2

A problem occurred evaluating settings 'AwesomeTSProject'.
> Could not read script '/Users/user/yarn-workspaces/packages/AwesomeTSProject/node_modules/@react-native-community/cli-platform-android/native_modules.gradle' as it does not exist.

* Try:
Run with --info or --debug option to get more log output. Run with --scan to get full insights.

* Exception is:
org.gradle.api.GradleScriptException: A problem occurred evaluating settings 'AwesomeTSProject'.
  at org.gradle.groovy.scripts.internal.DefaultScriptRunnerFactory$ScriptRunnerImpl.run(DefaultScriptRunnerFactory.java:93)
  ... 143 more
```

`packages/AwesomeTSProject/android/build.gradle`

```
allprojects {
    repositories {
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url("$rootDir/../../../node_modules/react-native/android")
        }
        maven {
            // Android JSC is installed from npm
            url("$rootDir/../../../node_modules/jsc-android/dist")
        }
        mavenCentral {
            // We don't want to fetch react-native from Maven Central as there are
            // older versions over there.
            content {
                excludeGroup "com.facebook.react"
            }
        }
        google()
        maven { url 'https://www.jitpack.io' }
    }
}
```

`packages/AwesomeTSProject/android/settings.gradle`

```
rootProject.name = 'AwesomeTSProject'
apply from: file("../../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesSettingsGradle(settings)
include ':app'
```

`packages/AwesomeTSProject/android/app/build.gradle`

```
project.ext.react = [
    enableHermes: false,  // clean and rebuild if changing
    cliPath: "../../../../node_modules/@react-native-community/cli",
]

apply from: "../../../../node_modules/react-native/react.gradle"

dependencies {
    if (enableHermes) {
        def hermesPath = "../../../../node_modules/hermes-engine/android/";
    }
}

apply from: file("../../../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesAppBuildGradle(project)
```

ここで AndroidStudio を再起動すると、 Gradle のビルドエラーが解消され、左のペインで app というパスが表示されると思います。

`yarn start` と `yarn android` で無事起動することができました。

## 参考記事

[JS奮闘記【yarn workspaceを使ったモノレポ管理】 | SRIA BLOG – 宮城県仙台市のWEBシステム開発・スマホアプリ開発](https://www.sria.co.jp/blog/2021/11/6318/)
