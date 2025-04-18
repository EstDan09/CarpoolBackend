const vehicleController = require("../controllers/vehicleController");

module.exports = function (app) {
    app.post("/backend/vehicle/register", vehicleController.registerVehicle);
    app.get("/backend/vehicle/get-all", vehicleController.getVehicles);
    app.get("/backend/vehicle/get/:id", vehicleController.getVehicleById);
}