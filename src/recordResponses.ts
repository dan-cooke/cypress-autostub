/**
 * @file recordResponses
 * @ignore
 * @description This file is responsible for listening to all possible requests using cy.route
 */
// Module level variable used to share recorded routes
/**
 * @ignore
 */
const recordedRoutes: any = [];
const recordResponses = () => {
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

          /* eslint-disable no-unused-expressions */
          response?.body?.text &&
            response.body.text().then((body: any) => {
              const { headers } = request;
              recordedRoutes.push({
                url,
                method: requestMethod,
                headers,
                status,
                response: JSON.parse(body),
              });
            });
        },
      })
    );
  };

  // Once the test has completed
  after(() => {
    cy.task("writeMockFile", {
      contents: JSON.stringify(recordedRoutes, null, "\t"),
    });
  });

  setupAllRoutes();
};

export default recordResponses;
