'use babel';

import * as path from 'path';
import {
  // eslint-disable-next-line no-unused-vars
  it, fit, wait, beforeEach, afterEach,
} from 'jasmine-fix';
import linterProselint from '../lib';

const linter = linterProselint.provideLinter();
const { lint } = linter;

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
    expect(messages[0].severity).toBe('warning');
    expect(messages[0].excerpt).toBe("'lol.' is chatspeak. Write it out.");
    expect(messages[0].location.file).toBe(badPath);
    expect(messages[0].location.position).toEqual([[0, 15], [0, 19]]);
  });
});
