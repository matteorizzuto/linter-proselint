'use babel'

module.exports.provideLinter = function() {
  const Helpers = require('atom-linter')
  return {
    name: 'proselint',
    grammarScopes: ['source.gfm', 'source.pfm'],
    scope: 'file',
    lintOnFly: false,
    lint: function (textEditor) {
      const filePath = textEditor.getPath()

      return Helpers.exec('proselint', ['--json', filePath]).then(function(output) {
        const raw = JSON.parse(output.toString())
        const rawResults = (((raw || { data: { errors: [] } }).data || { errors: [] }).errors || [])
        const results = rawResults.map((result) => ({
          type: result.type === 'error' ? 'Error' : 'Warning',
          text: result.message,
          range: [[ result.line, result.column ], [ result.line, result.column + result.extent ]],
          filePath: filePath
        }))
      })
    }
  }
}
