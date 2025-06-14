const statisticsController = require("../controllers/statisticsController");

module.exports = function (app) {
  app.get("/backend/statistics/trips/free-vs-paid", statisticsController.freeVsChargedTrips);
  app.get("/backend/statistics/trips/payment-method", statisticsController.tripPaymentStats);
  app.get("/backend/statistics/trips/passenger-approval", statisticsController.tripPassengerApprovalStats);
  app.get("/backend/statistics/trips/top-cost", statisticsController.topTripsByCostPerPerson);
  app.get("/backend/statistics/trips/top-drivers", statisticsController.topDriversByTripCount);
  app.get("/backend/statistics/trips/top-free", statisticsController.topDriversWithMostFreeTrips);
  app.get("/backend/statistics/trips/driver-revenue", statisticsController.averageRevenuePerDriver);
  app.get("/backend/statistics/trips/top-cancellations", statisticsController.topDriversWithMostCancellations);
  app.get("/backend/statistics/trips/hour-range", statisticsController.getTripsByHourRange);
  app.get("/backend/statistics/trips/hour", statisticsController.getTripsByHour);

  app.post("/backend/statistics/trips/by-month", statisticsController.filteredTripCountByMonth);

  app.get("/backend/statistics/users", statisticsController.userStatistics);
  app.get("/backend/statistics/users/recent", statisticsController.recentRegisteredUsers);
  app.get("/backend/statistics/users/top-approved", statisticsController.topUsersWithApprovedTrips);
  app.get("/backend/statistics/vehicles/by-driver", statisticsController.vehicleCountByDriver);

  app.post("/backend/statistics/users/by-month", statisticsController.filteredUserCountByMonth);
  app.post("/backend/statistics/users/by-age-range", statisticsController.userCountByAgeRanges);

  app.get("/backend/statistics/places/top", statisticsController.topVisitedPlaces);
  app.get("/backend/statistics/get-trips/:id", statisticsController.getTripsByDriver);



};
