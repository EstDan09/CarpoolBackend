const statisticsController = require("../controllers/statisticsController");

module.exports = function (app) {
  app.get("/backend/stats/freevscharged", statisticsController.freeVsChargedTrips);
};
