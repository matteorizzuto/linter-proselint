'use babel';

import * as path from 'path';
// eslint-disable-next-line no-unused-vars
import { it, fit, wait, beforeEach, afterEach } from 'jasmine-fix';
import linterProselint from '../lib';

const linter = linterProselint.provideLinter();
const lint = linter.lint;

const badPath = path.join(__dirname, 'fixtures', 'bad.txt');
const goodPath = path.join(__dirname, 'fixtures', 'good.txt');

describe('The proselint provider for Linter', () => {
  beforeEach(async () => {
    atom.workspace.destroyActivePaneItem();
    await atom.packages.activatePackage('linter-proselint');
  });

  it('finds nothing wrong with a valid file', async () => {
    const editor = await atom.workspace.open(goodPath);
    const messages = await lint(editor);
    expect(messages.length).toBe(0);
  });

  it('shows issues with a problematic file', async () => {
    const editor = await atom.workspace.open(badPath);
    const messages = await lint(editor);

    expect(messages.length).toBe(1);
    expect(messages[0].type).toBe('Warning');
    expect(messages[0].text).toBe("'lol.' is chatspeak. Write it out.");
    expect(messages[0].html).not.toBeDefined();
    expect(messages[0].filePath).toBe(badPath);
    expect(messages[0].range).toEqual([[0, 15], [0, 19]]);
  });
});
