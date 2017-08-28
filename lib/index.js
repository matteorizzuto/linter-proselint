'use babel';

// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions
import { CompositeDisposable } from 'atom';

export default {
  activate() {
    this.subscriptions = new CompositeDisposable();
    this.grammarScopes = [];

    this.subscriptions.add(atom.config.observe('linter-proselint.enabledScopes', (scopes) => {
      // Remove any old scopes
      this.grammarScopes.splice(0, this.grammarScopes.length);
      // Add the current scopes
      Array.prototype.push.apply(this.grammarScopes, scopes);
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter() {
    const Helpers = require('atom-linter');
    return {
      name: 'proselint',
      grammarScopes: this.grammarScopes,
      scope: 'file',
      lintOnFly: false,
      lint(textEditor) {
        const filePath = textEditor.getPath();
        const parameters = ['--json', filePath];
        const options = { ignoreExitCode: true };

        return Helpers.exec('proselint', parameters, options).then((output) => {
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
        });
      },
    };
  },
};
