module.exports = {
  preset: '@react-native/jest-preset',
  // pnpm stores packages below node_modules/.pnpm, so the default React Native
  // allow-list needs to match nested paths as well as npm's flat layout.
  transformIgnorePatterns: ['node_modules/(?!.*(?:react-native|@react-native)/)'],
};
