'use babel'

function activate () {
  console.log('linter-proselint was activated')
}

function deactivate () {
  console.log('linter-proselint was deactivated')
}

function provideLinter () {
  const exec = require('atom-linter').exec
  return {
    name: 'proselint',
    grammarScopes: ['source.gfm', 'source.pfm'],
    scope: 'file',
    lintOnFly: true,
    lint: function (textEditor) {
      return new Promise(function (resolve, reject) {
        return exec('proselint', ['--json', textEditor.getPath()], {})
        .then(function (output) {
          const raw = JSON.parse(output.toString())
          const rawResults = (((raw || { data: { errors: [] } }).data || { errors: [] }).errors || [])
          const results = rawResults.map((result) => ({
            type: result.type === 'error' ? 'Error' : 'Warning',
            text: result.message,
            range: [[ result.line, result.column ], [ result.line, result.column + result.extent ]],
            filePath: textEditor.getPath()
          }))
          return resolve(results)
        })
        .catch(reject)
      })
    }
  }
}

module.exports = {
  activate,
  deactivate,
  provideLinter
}
