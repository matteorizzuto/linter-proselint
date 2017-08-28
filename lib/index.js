'use babel';

// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions
import { CompositeDisposable } from 'atom';

// Dependencies
let helpers;

const loadDeps = () => {
  if (!helpers) {
    helpers = require('atom-linter');
  }
};

export default {
  activate() {
    this.idleCallbacks = new Set();
    let depsCallbackID;
    const installLinterProselintDeps = () => {
      this.idleCallbacks.delete(depsCallbackID);
      if (!atom.inSpecMode()) {
        require('atom-package-deps').install('linter-proselint');
      }
      loadDeps();
    };
    depsCallbackID = window.requestIdleCallback(installLinterProselintDeps);
    this.idleCallbacks.add(depsCallbackID);

    this.grammarScopes = [];

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-proselint.enabledScopes', (scopes) => {
      // Remove any old scopes
      this.grammarScopes.splice(0, this.grammarScopes.length);
      // Add the current scopes
      Array.prototype.push.apply(this.grammarScopes, scopes);
    }));
  },

  deactivate() {
    this.idleCallbacks.forEach(callbackID => window.cancelIdleCallback(callbackID));
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: 'proselint',
      grammarScopes: this.grammarScopes,
      scope: 'file',
      lintOnFly: false,
      lint: async (textEditor) => {
        loadDeps();
        const filePath = textEditor.getPath();
        const parameters = ['--json', filePath];
        const options = { ignoreExitCode: true };

        const output = await helpers.exec('proselint', parameters, options);
        const errors = JSON.parse(output.toString()).data.errors;

        return errors.map((error) => {
          const line = error.line - 1;
          const col = error.column - 1;
          return {
            type: error.type === 'error' ? 'Error' : 'Warning',
            text: error.message,
            range: [
              [line, col],
              [line, col + error.extent],
            ],
            filePath,
          };
        });
      },
    };
  },
};
