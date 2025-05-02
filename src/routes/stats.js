const statsController = require("../controllers/statsController");

module.exports = function (app) {
  app.get("/backend/stats/trips-by-hour", statsController.getTripsByHour);
  app.get("/backend/stats/trips-by-hour-range", statsController.getTripsByHourRange);  
};
