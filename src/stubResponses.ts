/**
 * @ignore
 * @param recordedResponses
 */
const stubResponses = (recordedResponses: any) => {
  recordedResponses.forEach((route: any) => {
    cy.route(route);
  });
};

export default stubResponses;
