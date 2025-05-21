const parameterController = require("../controllers/paremeterController");

module.exports = function (app) {
    app.post("/backend/parameter/register", parameterController.registerParameter);
    app.get("/backend/parameter/get-all", parameterController.getParameters);
    app.get("/backend/parameter/get-name/:name", parameterController.getParameterByName);
    app.get("/backend/parameter/get/:id", parameterController.getParameterById);
    app.put("/backend/parameter/update/:id", parameterController.updateParameter);
    app.delete("/backend/parameter/delete/:id", parameterController.deleteParameter);
};
