import * as fs from "fs";
import * as path from "path";
import { AutoStubGlobalConfig, GlobalDefaults } from "./types";

/**
 * @ignore
 */
let globalConfig: AutoStubGlobalConfig = GlobalDefaults;
/**
 * @ignore
 */
let mockFilePath: any;

/**
 * @ignore
 */
const pluginTasks = {
  readMockFile: () => {
    if (fs.existsSync(mockFilePath)) {
      return JSON.parse(fs.readFileSync(mockFilePath, "utf-8"));
    }
    return false;
  },
  writeMockFile: ({ contents }: { contents: string }) => {
    const dir = path.dirname(mockFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    try {
      fs.writeFileSync(mockFilePath, contents, { flag: "w" });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
  setMockFilePath: ({ path }: { path: string }) => (mockFilePath = path),
  getGlobalConfig: () => globalConfig,
};
/**
 * This function must be called in `cypress/plugins/index.js` like:
 * ```javascript
 * module.exports = (on, config) => {
 *      autoStubSetup(on, {
 *          // Pass in global settings here
 *      })
 * }
 * ```
 *
 * You can also optionally pass in a `globalSettings` object , to configure sensible defaults for your
 * application.
 * @param on - a handle the Cypress plugin events from cypress/plugins/index.js
 * @param globalSettings - globally defined settings
 */
const autoStubSetup = (
  on: Cypress.PluginEvents,
  globalSettings: AutoStubGlobalConfig
) => {
  if (globalSettings) {
    globalConfig = {
      ...globalConfig,
      ...globalSettings,
    };
  }

  on("task", pluginTasks);
};

export default autoStubSetup;
