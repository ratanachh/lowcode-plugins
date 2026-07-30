module.exports = {
  externals: {
    react: 'React',
    moment: 'moment',
    'react-dom': 'ReactDOM',
    'prop-types': 'PropTypes',
    '@alifd/next': 'Next',
    '@rchh/lowcode-engine': 'AliLowCodeEngine'
  },
  plugins: [
    [
      '@rchh/build-plugin-alt',
      {
        type: 'plugin',
        // 开启注入调试模式，see：https://www.yuque.com/lce/doc/ulvlkz
        inject: true,
        // 配置要打开的页面，在注入调试模式下，不配置此项的话不会打开浏览器
        // 支持直接使用官方 demo 项目：https://lowcode-engine.cn/demo/index.html
        openUrl: 'https://lowcode-engine.cn/demo/index.html?debug',
      }
    ],
    'build-plugin-component'
  ]
}
