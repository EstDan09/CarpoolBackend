const tripController = require("../controllers/tripController");

module.exports = function (app) {
  app.post("/backend/trip/register", tripController.registerTrip);
  app.get("/backend/trip/get-all", tripController.getTrips);
  app.get("/backend/trip/get/:id", tripController.getTripById);
  app.delete("/backend/trip/delete/:id", tripController.deleteTrip);
};
