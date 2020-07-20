import { AutoStubLocalConfig } from "./types";
import recordResponses from "./recordResponses";
import stubResponses from "./stubResponses";

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
  const testTitle = (Cypress as any).mocha.getRunner().test.title;

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

    cy.task("setMockFilePath", {
      path: mockFilePath,
    });
    cy.task("readMockFile").then((mockFile) => {
      const isForceRecording =
        Cypress.env("FORCE_RECORD") ||
        config.forceRecord ||
        globalConfig.forceRecord;

      if (isForceRecording || !mockFile) {
        recordResponses();
      } else {
        stubResponses(mockFile);
      }
    });
  });
}

export default autoStub;
