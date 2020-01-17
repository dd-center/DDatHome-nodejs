const { exec } = require('pkg')

;

[
  ['node12-win-x64', '.exe'],
  ['node12-macos-x64'],
  ['node12-linux-x64']
].map(([target, e = '']) => ['index.js', '--target', target, '--output', `./dist/${target}${e}`])
  .map(params => async () => exec(params))
  .reduce((p, f) => p.then(f), Promise.resolve(233))
