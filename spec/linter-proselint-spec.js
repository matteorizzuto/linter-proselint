'use babel'

import * as path from 'path'

const badPath = path.join(__dirname, 'fixtures', 'bad.txt')
const goodPath = path.join(__dirname, 'fixtures', 'good.txt')

describe('The proselint provider for Linter', () => {
  const lint = require(path.join('..', 'lib', 'index.js')).provideLinter().lint

  beforeEach(() => {
    atom.workspace.destroyActivePaneItem()
    waitsForPromise(() => atom.packages.activatePackage('linter-proselint'))
  })

  it('finds nothing wrong with a valid file', () => {
    waitsForPromise(() =>
      atom.workspace.open(goodPath).then(editor => lint(editor)).then(messages => {
        expect(messages.length).toBe(0)
      })
    )
  })

  it('shows issues with a problematic file', () => {
    waitsForPromise(() =>
      atom.workspace.open(badPath).then(editor => lint(editor)).then(messages => {
        expect(messages.length).toBe(1)

        expect(messages[0].type).toBe('Warning')
        expect(messages[0].text).toBe("'lol.' is chatspeak. Write it out.")
        expect(messages[0].html).not.toBeDefined()
        expect(messages[0].filePath).toBe(badPath)
        expect(messages[0].range).toEqual([[0, 15], [0, 19]])
      })
    )
  })
})
