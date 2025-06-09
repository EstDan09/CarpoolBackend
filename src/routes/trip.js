const tripController = require("../controllers/tripController");

module.exports = function (app) {
  app.post("/backend/trip/register", tripController.registerTrip);
  app.get("/backend/trip/get-all", tripController.getTrips);
  app.get("/backend/trip/get/:id", tripController.getTripById);
  app.delete("/backend/trip/delete/:id", tripController.deleteTrip);
  app.patch("/backend/trip/:id/stops/:placeId/status", tripController.updateStopStatus);
  app.patch("/backend/trip/:id/passengers/:userId/status", tripController.updatePassengerStatus);
  app.post("/backend/trip/:id/stops", tripController.addStopToTrip);
  app.post("/backend/trip/:id/passengers", tripController.addPassengerToTrip);
  app.get("/backend/trip/:id/passengers", tripController.getTripPassengers);
  app.get("/backend/trip/with-passenger-count", tripController.getAllTripsWithPassengerCount);
  app.get("/backend/trips/user/:userId", tripController.getTripsByPassenger);
  app.put("/backend/trips/:id/cancel/:userId", tripController.cancelPassengerTrip);
};

//GET /backend/trips/user/664abc123456?status=all
//GET /backend/trips/user/664abc123456?status=Aprobado
//GET /backend/trips/user/664abc123456?driver=true