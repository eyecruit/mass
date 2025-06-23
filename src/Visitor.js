import { ChildProcess } from 'node:child_process';

class Visitor {
  /**
   * @param {function(string, object?):Promise<ChildProcess>} open
   * @param {string[]} urls
   * @param {{name: string | readonly string[], arguments?: readonly string[] | undefined}} app
   * @param {boolean} incognito - Whether to open URLs in incognito mode
   * @returns {void}
   */
  constructor(open, urls, app, incognito = false) {
    if (!urls) throw new Error('Url cannot be empty!');

    this._open = open;
    this._urls = urls;
    this._app = app;
    
    // Add incognito flag if enabled and not already in arguments
    if (incognito && app.arguments && !app.arguments.includes('--incognito')) {
      this._app = {
        ...app,
        arguments: [...(app.arguments || []), '--incognito']
      };
    }
  }

  /**
   * execute
   * @param {number} count number of iteration
   * @returns {void}
   */
  execute(count) {
    for (let index = 0; index < count; index++) {
      this._urls.forEach(async (url) => {
        await this._open(url, { app: this._app });
      });
    }
  }
}

export default Visitor;
