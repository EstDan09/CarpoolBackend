const institutionController = require("../controllers/institutionController");

module.exports = function (app) {
  app.post("/backend/institution/register", institutionController.registerInstitution);
  app.get("/backend/institution/get-all", institutionController.getInstitutions);
  app.get("/backend/institution/get/:id", institutionController.getInstitutionById);
  app.put("/backend/institution/update/:id", institutionController.updateInstitution);
  app.delete("/backend/institution/delete/:id", institutionController.deleteInstitution);
};
