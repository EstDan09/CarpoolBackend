const officeController = require("../controllers/officeController");

module.exports = function (app) {
  app.post("/backend/office/register", officeController.registerOffice);
  app.get("/backend/office/get-all", officeController.getOffices);
  app.get("/backend/office/get/:id", officeController.getOfficeById);
  app.put("/backend/office/update/:id", officeController.updateOffice);
  app.delete("/backend/office/delete/:id", officeController.deleteOffice);
};
