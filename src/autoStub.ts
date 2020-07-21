import { AutoStubLocalConfig } from "./types";
import recordResponses from "./recordResponses";
import stubResponses from "./stubResponses";

/**
 * this in internal variable used to hold a reference to other autoStub calls in the same Cypress test
 * this allows autoStub to be "smart" about where it writes request objects,
 * cutting down on the storage requirements of the mock files
 * @ignore
 */
let existingRouteMap = {};
/**
 * This function must be called in order to begin stubbing/recording.
 * The function can be called from anywhere inside a Cypress hook
 * 
 * ```javascript
import { autoStub } from 'cypress-autostub'

describe('Some Feature', () => {
        beforeEach(() => {
            // Put it in a before each
            autoStub()
        })
        it('should do the thing', () => {
            // Or even at the test level
            autoStub()

        })
})
 * ```
 * @param config - local settings allow you to override any global settings for a particular instance
 */
function autoStub(config: AutoStubLocalConfig = {}) {
  let testTitle = "";

  if (!config.filename) {
    try {
      testTitle = (Cypress as any).mocha.getRunner().test.title;
    } catch (e) {
      throw Error(`cypress-autostub was unable to determine the test title. The plugin currently only supports the following lifecycle hooks:
      - beforeEach
      - afterEach

      Or alternatively you can call it from a test body
      `);
    }
  } else {
    testTitle = config.filename;
  }

  afterEach(() => {
    existingRouteMap = {};
  });

  cy.task("getGlobalConfig").then((globalConfig: any) => {
    const whitelist = config?.whitelist || globalConfig?.whitelist;
    if (whitelist) {
      cy.server({
        // This is kinda ugly, but they must be doing hasOwnProperty in cypress, because if config.whitelist
        // is undefined, it throws an error
        whitelist,
      });
    } else {
      cy.server();
    }
    const mockFilePath = `${
      globalConfig.mockFileDirectory
    }/${Cypress.spec.name.replace(".spec.js", "")}/${testTitle}.json`;

    // Set this value "globally" so the plugin does not have pass it around
    cy.task("setMockFilePath", {
      path: mockFilePath,
    });

    // Read the mock file, if it exists
    cy.task("readMockFile").then((mockFile: any) => {
      // The user can always decide to overwrite the current mock file with a forceRecord option
      const isForceRecording =
        Cypress.env("FORCE_RECORD") ||
        config.forceRecord ||
        globalConfig.forceRecord;

      if (isForceRecording || !mockFile) {
        if (isForceRecording) {
          cy.log(
            "[cypress-autostub] forceRecord = true, recording new mock file"
          );
        } else {
          cy.log(`[cypress-autostub] No mock file found for ${mockFilePath}`);
        }
        // We pass in the existing route map here so we dont record duplicate routes
        // Saves storage space
        recordResponses(existingRouteMap, config);
      } else {
        cy.log(`[cypress-autostub] Found existing mock file ${mockFilePath}`);
        cy.log("[cypress-autostub] Stubbing responses using mock file");
        existingRouteMap = {
          ...existingRouteMap,
          ...mockFile,
        };
        // If we have a mock file written - just go ahead and load the routes into cy.route
        stubResponses(mockFile);
      }
    });
  });
}

export default autoStub;
