const userController = require("../controllers/userController");

module.exports = function (app) {
    app.post("/backend/user/register", userController.register);
    app.post("/backend/user/login", userController.login);
    app.post("/backend/user/addCars", userController.addCars);
    app.put("/backend/user/update/:id", userController.update); 
    app.get("/backend/user/:id", userController.getUserById); 
    app.get("/backend/users", userController.getAllUsers); 
    app.post("/backend/user/add-notification", userController.addNotificationToUser);
};
