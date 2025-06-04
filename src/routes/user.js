const userController = require("../controllers/userController");

module.exports = function (app) {
    app.post("/backend/user/register", userController.register);
    app.post("/backend/user/login", userController.login);
    app.post("/backend/user/addCars", userController.addCars);
}