import { exec } from 'pkg'

;

[
  ['node16-win-x64', '.exe'],
  ['node16-macos-x64'],
  ['node16-linux-x64']
].map(([target, e = '']) => ['index.js', '--target', target, '--output', `./dist/${target}${e}`])
  .map(params => () => exec(params))
  .reduce((p, f) => p.then(f), Promise.resolve())
