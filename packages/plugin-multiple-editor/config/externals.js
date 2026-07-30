module.exports = function (webpackEnv) {
  const isEnvProduction = webpackEnv === 'production';

  return isEnvProduction ? {
    'react': 'react',
    'react-dom': 'react-dom',
    '@rchh/lowcode-engine': '@rchh/lowcode-engine',
    '@rchh/lowcode-engine-ext': '@rchh/lowcode-engine-ext',
    '@alifd/next': '@alifd/next',
    'prettier/esm/standalone.mjs': 'prettier/esm/standalone.mjs',
  } : {
    'react': 'React',
    'react-dom': 'ReactDOM',
    '@rchh/lowcode-engine': 'AliLowCodeEngine',
    '@rchh/lowcode-engine-ext': 'AliLowCodeEngineExt',
    '@alifd/next': 'Next',
    'prettier/esm/standalone.mjs': 'prettier',
  }
}