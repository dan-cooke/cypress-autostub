/**
 * @ignore
 */
type Whitelist = (xhr: Request) => void;

/**
 * Here you will find the reference documentation for any globally configurable options.
 *
 * These settings must be passed in to `autoStubSetup` in `cypress/plugins/index.js`
 *
 * ```javascript
 * module.exports = (on, config) => {
 *
 *      autoStubSetup(on, {
 *          mockFileDirectory: 'cypress/fixtures'
 *      })
 * }
 * ```
 */
export interface AutoStubGlobalConfig {
  /**
   * The directory where mock files should be written relative to project root
   */
  mockFileDirectory?: string;
  /**
   * If **true** we will begin overwriting any existing mock files for the current spec+test
   */
  forceRecord?: boolean;
  /**
   * Exactly the same as cypress [`cy.server`](https://docs.cypress.io/api/commands/server.html#Arguments) whitelist function.
   * Allows users to build a whitelist per request at a global level.
   *
   * A whitelist in this context does *not* get stubbed/recorded by cy.route
   *
   * Use this to keep your mock files smaller by whitelisting non essential requests like
   * translations, and other static assets
   *
   * ```javascript
   * autoStubSetup(on, {
   *    whitelist: (xhr => {
   *        if (xhr.url.includes('static')) {
   *            return true;
   *        }
   *    })
   *
   * })
   * ```
   */
  whitelist?: Whitelist;
}
export const GlobalDefaults: AutoStubGlobalConfig = {
  mockFileDirectory: "cypress/mocks",
};

export interface AutoStubRouteFilter {
  method?: string | [string];
  url?: string | RegExp;
  headers?: any;
}
export interface AutoStubLocalConfig {
  /**
   * Exactly the same as cypress [`cy.server`](https://docs.cypress.io/api/commands/server.html#Arguments) whitelist function.
   * Allows users to build a whitelist per request at a local level.
   *
   * A whitelist in this context does *not* get stubbed/recorded by cy.route
   *
   * Use this to keep your mock files smaller by whitelisting non essential requests like
   * translations, and other static assets
   *
   * This allows you to specify a whitelist for a particular spec file, for example you may want
   * to ignore GraphQL requests on a particular page, but mock all other REST fetches
   *
   * ```javascript
   * autoStub({
   *    whitelist: (xhr => {
   *        if (xhr.url.includes('graphql')) {
   *            return true;
   *        }
   *    })
   *
   * })
   * ```
   */
  whitelist?: Whitelist;

  /**
   * If **true** we will begin overwriting any existing mock files for the current spec+test
   */
  forceRecord?: boolean;
}
