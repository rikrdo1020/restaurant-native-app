const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// // Excluir devtools completamente en web
// config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
// config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// // Transformaciones para web
// config.transformer.getTransformOptions = async () => ({
//   transform: {
//     experimentalImportSupport: false,
//     inlineRequires: false,
//   },
// });

// if (process.env.EXPO_PLATFORM === 'web') {
//   config.resolver.alias = {
//     ...config.resolver.alias,
//     'react-native$': 'react-native-web',
//   };
// }

module.exports = config;