const Trip = require("../models/Trip");
const User = require("../models/User");

//Proporcion de viajes gratis y proporcion de viajes cobrados
exports.freeVsChargedTrips = async (req, res) => {
    try {
        const result = await Trip.aggregate([
            {
              $facet: {
                free: [
                  { $match: { costPerPerson: 0 } },
                  { $count: "amount" }
                ],
                total: [
                  { $count: "amount" }
                ]
              }
            }
          ]);

        //Si no hay ninguno gratis
        let freeCount;
        if (!result[0].free[0]) {
          freeCount = 0;
        //Si hay al menos uno gratis
        } else {
          freeCount = result[0].free[0].amount;
        }
        console.log(freeCount);

        let totalCount;
        //Si no hay viajes en total
        if (!result[0].total[0]) {
          totalCount = 0;
        //Si hay al mmenos un viaje en total
        } else {
          totalCount = result[0].total[0].amount;
        }
        response = {
          totalCount : totalCount,
          freeCount : freeCount,
          paidCount : totalCount-freeCount,
          freeProportion : freeCount/totalCount,
          paidProportion : 1-freeCount/totalCount
        }
        console.log(response);
        res.status(201).json({ msg: "Estadisticas obtenidas exitosamente", data: response });
    } catch (error) {
        console.error("Error al cargar estadistica", error);
        res.status(500).json({ msg: "Error al cargar estadistica"});
    } 
}