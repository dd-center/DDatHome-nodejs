const { exec } = require('pkg')

;

[
  ['node18-win-x64', '.exe'],
  ['node18-macos-x64'],
  ['node18-linux-x64']
].map(([target, e = '']) => ['index.js', '--target', target, '--output', `./dist/${target}${e}`])
  .map(params => () => exec(params))
  .reduce((p, f) => p.then(f), Promise.resolve(233))
