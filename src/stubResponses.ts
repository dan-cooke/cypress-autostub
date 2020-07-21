/**
 * @ignore
 * @param recordedResponses
 */
const stubResponses = (recordedResponses: any) => {
  Object.values(recordedResponses).forEach((route: any) => {
    cy.route(route);
  });
};

export default stubResponses;
