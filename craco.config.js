module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      return {
        ...webpackConfig,
        entry: {
          main: [
            env === 'development' &&
              require.resolve('react-dev-utils/webpackHotDevClient'),
            paths.appIndexJs,
          ].filter(Boolean),
          background: './src/chrome/background.ts',
          content: './src/content/index.tsx',
        },
        output: {
          ...webpackConfig.output,
          filename: 'static/js/[name].js',
        },
        optimization: {
          ...webpackConfig.optimization,
          runtimeChunk: false,
          // Disable shared chunk splitting so background and content are self-contained.
          // main still gets its async route chunks via dynamic import().
          splitChunks: false,
        },
      };
    },
  },
};
