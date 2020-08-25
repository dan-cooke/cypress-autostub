import { AutoStubLocalConfig } from "./types";
import stubResponses from "./stubResponses";

/**
 * this in internal variable used to hold a reference to other autoStub calls in the same Cypress test
 * this allows autoStub to be "smart" about where it writes request objects,
 * cutting down on the storage requirements of the mock files
 * @ignore
 */
let existingRouteMap: any = {};
let newRoutesToWrite: any = {};

let currentlyRecording = false;
/**
 * This function must be called in order to begin stubbing/recording.
 * The function can be called from anywhere inside a Cypress hook
 * 
 * ```javascript
import { autoStub } from 'cypress-autostub'
import recordResponses from '../dist/recordResponses.d';

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
  afterEach(() => {
    if (Object.keys(newRoutesToWrite).length > 0) {
      cy.task("writeMockFile", {
        contents: JSON.stringify(newRoutesToWrite, null, "\t"),
      });
    }
  });

  beforeEach(() => {
    let testTitle = "";
    existingRouteMap = {};
    newRoutesToWrite = {};
    currentlyRecording = false;

    if (!config.filename) {
      try {
        testTitle = (Cypress as any).mocha.getRunner().suite.ctx.currentTest
          .title;
      } catch (e) {
        throw Error(
          `cypress-autostub was unable to determine the test title. Please make sure you call this function from your describe block.`
        );
      }
    } else {
      testTitle = config.filename;
    }
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

      const recordResponses = () => {
        ["GET", "POST", "PUT", "DELETE", "PATCH"].forEach((method) =>
          cy.route({
            url: "*", // just record everything
            method,
            onResponse: (xhtml: any) => {
              const {
                url,
                method: requestMethod,
                status,
                request,
                response,
              } = xhtml;

              const addRouteToWriteList = () => {
                /* eslint-disable no-unused-expressions */
                response?.body?.text &&
                  response.body.text().then((body: any) => {
                    const { headers } = request;
                    // TODO: this will not be sufficient when Cypress implements full network stubbing
                    // TODO: it will be possible for users to stub based on many parameters,
                    // TODO: so it would require object as keys instead of a string
                    newRoutesToWrite[url] = {
                      url,
                      method: requestMethod,
                      headers,
                      status,
                      response: JSON.parse(body),
                    };
                  });
              };
              // Users can pass in an overrideExistingRoutes to control if a previously recorded route from the same
              // test suite, should be overwritten by a future call to autoStub
              // If this option is not supplied, we should not add the response to the list of routes
              if (!existingRouteMap[url] || config.overrideExistingRoutes) {
                addRouteToWriteList();
              }
            },
          })
        );
      };
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
          recordResponses();
          currentlyRecording = true;
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
  });
}

export default autoStub;
