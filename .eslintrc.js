module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    wx: 'readonly',
    getApp: 'readonly',
    App: 'readonly',
    Component: 'readonly',
    Page: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'handle-callback-err': 'off'
  }
}
