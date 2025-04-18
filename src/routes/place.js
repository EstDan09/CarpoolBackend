const placeController = require("../controllers/placeController");

module.exports = function (app) {
  app.post("/backend/place/register", placeController.registerPlace);
  app.get("/backend/place/get-all", placeController.getPlaces);
  app.get("/backend/place/get/:id", placeController.getPlaceById);
  app.put("/backend/place/update/:id", placeController.updatePlace);
  app.delete("/backend/place/delete/:id", placeController.deletePlace);
};
