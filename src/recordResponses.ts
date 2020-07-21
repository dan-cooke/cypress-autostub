/**
 * @file recordResponses
 * @ignore
 * @description This file is responsible for listening to all possible requests using cy.route
 */
// Module level variable used to share recorded routes

import { AutoStubLocalConfig } from "./types";

/**
 * @ignore
 */
const newRoutesToWrite: any = {};
const recordResponses = (
  existingRouteMap: any,
  config: AutoStubLocalConfig
) => {
  const setupAllRoutes = () => {
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

  // Once the test has completed
  afterEach(() => {
    cy.task("writeMockFile", {
      contents: JSON.stringify(newRoutesToWrite, null, "\t"),
    });
  });
  setupAllRoutes();
};

export default recordResponses;
