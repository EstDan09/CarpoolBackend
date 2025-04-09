const placeController = require("../controllers/placeController");

module.exports = function (app) {
    app.post("/backend/place/register", placeController.registerPlace);
    app.get("/backend/place/get-all", placeController.getPlaces);
    app.get("/backend/place/get/:id", placeController.getPlaceById);


}