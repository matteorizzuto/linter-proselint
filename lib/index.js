'use babel'

module.exports.provideLinter = function () {
  const Helpers = require('atom-linter')
  return {
    name: 'proselint',
    grammarScopes: ['source.gfm', 'source.pfm', 'source.md'],
    scope: 'file',
    lintOnFly: false,
    lint: function (textEditor) {
      const filePath = textEditor.getPath()

      return Helpers.exec('proselint', ['--json', filePath]).then(function (output) {
        const parsed = JSON.parse(output.toString())

        if (parsed.status === 'success') {
          return []
        }
        return parsed.data.errors.map(function (error) {
          return {
            type: error.type === 'error' ? 'Error' : 'Warning',
            text: error.message,
            range: [[ error.line, error.column ], [ error.line, error.column + error.extent ]],
            filePath: filePath
          }
        })
      })
    }
  }
}
