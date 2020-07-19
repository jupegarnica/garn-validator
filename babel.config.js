module.exports = function (api) {
  api.cache(true);

  const presets = [[
    '@babel/preset-env',
    {
      targets: {
        node: 'current',
      },
    },
  ]];
  const plugins = ['@babel/plugin-proposal-class-properties'];

  return {
    presets,
    plugins,
    // exclude: ['**/*stories.js', '**/*stories.jsx'],
    minified: true,
    comments: false,
  };
};
