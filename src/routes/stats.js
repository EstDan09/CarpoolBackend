const statsController = require("../controllers/statsController");

module.exports = function (app) {
  app.get("/backend/stats/trip-hour", statsController.getTripsByHour);  
};
