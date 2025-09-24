module.exports = {
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env', // Toujours utiliser .env
        safe: false,
        allowUndefined: true,
      },
    ]
  ],
  presets: ['module:@react-native/babel-preset'],
};