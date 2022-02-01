
/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require("path");

const projectRoot = path.join(__dirname, "packages/AwesomeTSProject");
const watchFolders = [path.resolve(__dirname, "node_modules")];

module.exports = {
  projectRoot,
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    resolverMainFields: ["react-native", "browser", "module", "main"],
  },
  watchFolders,
};
