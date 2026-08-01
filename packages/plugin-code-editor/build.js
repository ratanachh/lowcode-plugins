module.exports = {
  plugins: [
    [
      'build-plugin-fusion',
      {
        themePackage: '@alifd/theme-lowcode-light',
      },
    ],
    [
      '@rchh/build-plugin-alt',
      {
        type: 'plugin',
        // Enable injection debug mode, see: https://www.yuque.com/lce/doc/ulvlkz
        inject: true,
        // Page to open; in injection debug mode the browser is not opened unless this is set
        // The official demo project can be used directly: https://lowcode-engine.cn/demo/index.html
        // openUrl: 'https://lowcode-engine.cn/demo/index.html?debug',
      },
    ],
    './build.plugin.js',
  ],
};
