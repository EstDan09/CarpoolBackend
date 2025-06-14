const Trip = require("../models/Trip");
const User = require("../models/User");
const mongoose = require("mongoose");

// Retorna el total de viajes con timepo de salida entre startHour y endHour
exports.getTripsByHour = async (req, res) => {
  try {
    const startHour = req.query.start;
    const endHour = req.query.end;    

    if(!startHour && startHour!=0  || !endHour && endHour!=0){
      return res.status(400).json({ msg: "Campos obligatorios faltantes." });
    }    
    
    const result = await Trip.aggregate([
      { $project: { "hour": { $hour: "$departure" } } },
       { $match: { "hour": { $gte: Number(startHour), $lt: Number(endHour) } } },
      { $count : "total"}]);
        
    const trips = result.length ? result[0] : {total:0}
    
    res.status(200).json({ msg: "Datos obtenidos exitosamente.", data: trips });
  } catch (error) {
    console.error("Error al obtener datos:", error);
    res.status(500).json({ msg: "Error al obtener los datos." });
  }
};

// Retorna una estadistica con los viajes agrupados por franjas horarias predefinidas.
exports.getTripsByHourRange = async (req, res) => {
  try {    

    const result = await Trip.aggregate([
      {$facet : {
        total : [{$count: "total"}],
        morning : [
          { $project: { "hour": { $hour: "$departure" } } },
          { $match: { "hour": { $gte: 6, $lt: 12 } } },
          { $count : "total"}],
        afternoon: [
          { $project: { "hour": { $hour: "$departure" } } },
          { $match: { "hour": { $gte: 12, $lt: 18 } } },
          { $count : "total"}]
        }
      }
    ]);    

    const data  = {
      total: result[0].total[0].total,
      morning: result[0].morning[0].total,
      afternoon: result[0].afternoon[0].total,
      night: result[0].total[0].total - result[0].morning[0].total - result[0].afternoon[0].total
    }  

    res.status(200).json({ msg: "Datos obtenidos exitosamente.", data: data });
  } catch (error) {
    console.error("Error al obtener datos:", error);
    res.status(500).json({ msg: "Error al obtener los datos." });
  }
};

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

exports.userStatistics = async (req, res) => {
  try {
    const today = new Date();

    const users = await User.aggregate([
      {
        $facet: {
          totalDrivers: [
            { $match: { role: "Conductor" } },
            { $count: "count" }
          ],
          totalPassengers: [
            { $match: { role: "Pasajero" } },
            { $count: "count" }
          ],
          totalActive: [
            { $match: { type: { $in: ["Administrador", "Usuario"] } } },
            { $count: "count" }
          ],
          avgAge: [
            {
              $project: {
                birthDate: 1,
                age: {
                  $floor: {
                    $divide: [
                      { $subtract: [today, "$birthDate"] },
                      1000 * 60 * 60 * 24 * 365.25
                    ]
                  }
                }
              }
            },
            {
              $group: {
                _id: null,
                avgAge: { $avg: "$age" }
              }
            }
          ]
        }
      }
    ]);

    const result = {
      totalDrivers: users[0].totalDrivers[0]?.count || 0,
      totalPassengers: users[0].totalPassengers[0]?.count || 0,
      totalActiveUsers: users[0].totalActive[0]?.count || 0,
      averageAge: users[0].avgAge[0]?.avgAge ? Math.round(users[0].avgAge[0].avgAge * 100) / 100 : null
    };

    res.status(200).json({
      msg: "Estadísticas de usuarios obtenidas exitosamente.",
      data: result
    });

  } catch (error) {
    console.error("Error al obtener estadísticas de usuarios:", error);
    res.status(500).json({ msg: "Error al obtener estadísticas de usuarios." });
  }
};

exports.filteredUserCountByMonth = async (req, res) => {
  try {
    const { institutionId, startDate, endDate, genres, role } = req.body;

    if (!institutionId || !startDate || !endDate || !role) {
      return res.status(400).json({ msg: "Faltan campos obligatorios: institutionId, startDate, endDate y role." });
    }

    const matchStage = {
      role: role,
      institutionId: institutionId,
      birthDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (Array.isArray(genres) && genres.length > 0) {
      matchStage.genre = { $in: genres };
    }

    const users = await User.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$birthDate" },
            month: { $month: "$birthDate" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    // Transformar el resultado para que tenga formato legible
    const data = users.map(u => ({
      year: u._id.year,
      month: u._id.month,
      count: u.count
    }));

    res.status(200).json({
      msg: `Cantidad de ${role.toLowerCase()}s por mes obtenida correctamente.`,
      data
    });

  } catch (error) {
    console.error("Error al contar usuarios por mes:", error);
    res.status(500).json({ msg: "Error interno al contar usuarios por mes." });
  }
};

exports.userCountByAgeRanges = async (req, res) => {
  try {
    const today = new Date();
    const { ranges } = req.body;

    const ageRanges = Array.isArray(ranges) && ranges.length > 0 ? ranges : [
      { min: 0, max: 18 },
      { min: 19, max: 30 },
      { min: 31, max: 45 },
      { min: 46, max: 60 },
      { min: 61, max: 75 },
      { min: 76, max: 120 }
    ];

    const users = await User.aggregate([
      {
        $project: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [today, "$birthDate"] },
                1000 * 60 * 60 * 24 * 365.25
              ]
            }
          }
        }
      }
    ]);

    const result = ageRanges.map(r => ({
      range: `${r.min}-${r.max === Infinity ? '+' : r.max}`,
      min: r.min,
      max: r.max,
      count: 0
    }));

    users.forEach(user => {
      const age = user.age;
      const bucket = result.find(r => age >= r.min && age <= r.max);
      if (bucket) bucket.count++;
    });

    res.status(200).json({
      msg: "Usuarios agrupados por rangos de edad.",
      data: result
    });

  } catch (error) {
    console.error("Error al agrupar usuarios por edad:", error);
    res.status(500).json({ msg: "Error interno al agrupar usuarios por edad." });
  }
};

/* {
  "ranges": [
    { "min": 18, "max": 25 },
    { "min": 26, "max": 35 },
    { "min": 36, "max": 99 }
  ]
} */

exports.tripPaymentStats = async (req, res) => {
  try {
    const result = await Trip.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          free: [{ $match: { paymethod: "Gratuito" } }, { $count: "count" }]
        }
      }
    ]);

    const total = result[0].total[0]?.count || 0;
    const free = result[0].free[0]?.count || 0;
    const paid = total - free;

    res.status(200).json({
      msg: "Estadísticas de viajes por método de pago obtenidas correctamente.",
      data: {
        totalTrips: total,
        freeTrips: free,
        paidTrips: paid
      }
    });
  } catch (error) {
    console.error("Error al obtener estadísticas de métodos de pago:", error);
    res.status(500).json({ msg: "Error interno al obtener estadísticas de viajes." });
  }
};

exports.tripPassengerApprovalStats = async (req, res) => {
  try {
    const result = await Trip.aggregate([
      {
        $project: {
          approvedCount: {
            $size: {
              $filter: {
                input: "$passengers",
                as: "p",
                cond: { $eq: ["$$p.status", "Aprobado"] }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $eq: ["$approvedCount", 1] }, then: "1" },
                { case: { $eq: ["$approvedCount", 2] }, then: "2" },
                { case: { $eq: ["$approvedCount", 3] }, then: "3" },
                { case: { $eq: ["$approvedCount", 4] }, then: "4" },
                { case: { $gt: ["$approvedCount", 4] }, then: "5+" }
              ],
              default: "0"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    const stats = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5+": 0
    };

    result.forEach(r => {
      if (stats.hasOwnProperty(r._id)) {
        stats[r._id] = r.count;
      }
    });

    res.status(200).json({
      msg: "Estadísticas de viajes por cantidad de pasajeros aprobados.",
      data: stats
    });

  } catch (error) {
    console.error("Error al calcular estadísticas de pasajeros aprobados:", error);
    res.status(500).json({ msg: "Error interno al calcular estadísticas de pasajeros." });
  }
};

exports.vehicleCountByDriver = async (req, res) => {
  try {
    const result = await User.aggregate([
      { $match: { role: "Conductor" } },
      {
        $project: {
          vehicleCount: { $size: { $ifNull: ["$vehicles", []] } }
        }
      },
      {
        $group: {
          _id: "$vehicleCount",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const data = result.map(r => ({
      vehicles: r._id,
      drivers: r.count
    }));

    res.status(200).json({
      msg: "Cantidad de conductores por número de vehículos.",
      data
    });

  } catch (error) {
    console.error("Error al obtener estadísticas de vehículos por conductor:", error);
    res.status(500).json({ msg: "Error interno al obtener estadísticas." });
  }
};

exports.filteredTripCountByMonth = async (req, res) => {
  try {
    const { institutionId, startDate, endDate, hourStart, hourEnd } = req.body;

    if (!institutionId || !startDate || !endDate || !hourStart || !hourEnd) {
      return res.status(400).json({ msg: "Faltan campos obligatorios: institutionId, startDate, endDate, hourStart, hourEnd." });
    }

    // Convertir horas a enteros comparables (ej: "06:30" -> 630)
    const parseHour = (h) => {
      const [hour, minute] = h.split(":").map(Number);
      return hour * 100 + minute;
    };

    const hStart = parseHour(hourStart);
    const hEnd = parseHour(hourEnd);

    const result = await Trip.aggregate([
      {
        $match: {
          departure: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "driver",
          foreignField: "_id",
          as: "driverData"
        }
      },
      { $unwind: "$driverData" },
      {
        $match: {
          "driverData.institutionId": mongoose.Types.ObjectId(institutionId)
        }
      },
      {
        $addFields: {
          depHour: {
            $add: [
              { $multiply: [{ $hour: "$departure" }, 100] },
              { $minute: "$departure" }
            ]
          }
        }
      },
      {
        $match: {
          depHour: { $gte: hStart, $lte: hEnd }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$departure" },
            month: { $month: "$departure" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    const data = result.map(r => ({
      year: r._id.year,
      month: r._id.month,
      count: r.count
    }));

    res.status(200).json({
      msg: "Cantidad de viajes por mes filtrada correctamente.",
      data
    });

  } catch (error) {
    console.error("Error al contar viajes por mes:", error);
    res.status(500).json({ msg: "Error interno al contar viajes por mes." });
  }
};

exports.topDriversByTripCount = async (req, res) => {
  try {
    const result = await Trip.aggregate([
      {
        $group: {
          _id: "$driver",
          tripCount: { $sum: 1 }
        }
      },
      { $sort: { tripCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "driver"
        }
      },
      { $unwind: "$driver" },
      {
        $project: {
          _id: 0,
          driverId: "$driver._id",
          name: "$driver.name",
          email: "$driver.email",
          tripCount: 1
        }
      }
    ]);

    res.status(200).json({
      msg: "Top 5 conductores con más viajes.",
      data: result
    });
  } catch (error) {
    console.error("Error al obtener top de conductores:", error);
    res.status(500).json({ msg: "Error interno al obtener el top de conductores." });
  }
};

exports.topVisitedPlaces = async (req, res) => {
  try {
    const result = await Trip.aggregate([
      {
        $facet: {
          endpoints: [
            {
              $group: {
                _id: "$endpoint",
                count: { $sum: 1 }
              }
            }
          ],
          stops: [
            { $unwind: "$stops" },
            {
              $group: {
                _id: "$stops.place",
                count: { $sum: 1 }
              }
            }
          ]
        }
      },
      {
        $project: {
          allPlaces: {
            $concatArrays: ["$endpoints", "$stops"]
          }
        }
      },
      { $unwind: "$allPlaces" },
      {
        $group: {
          _id: "$allPlaces._id",
          totalVisits: { $sum: "$allPlaces.count" }
        }
      },
      { $sort: { totalVisits: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "places",
          localField: "_id",
          foreignField: "_id",
          as: "place"
        }
      },
      { $unwind: "$place" },
      {
        $project: {
          _id: 0,
          placeId: "$place._id",
          name: "$place.name",
          totalVisits: 1
        }
      }
    ]);

    res.status(200).json({
      msg: "Top 5 lugares más visitados (como destino o parada).",
      data: result
    });
  } catch (error) {
    console.error("Error al obtener top de lugares:", error);
    res.status(500).json({ msg: "Error interno al obtener top de lugares." });
  }
};

exports.topUsersWithApprovedTrips = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5; 

    const result = await Trip.aggregate([
      { $unwind: "$passengers" },
      { $match: { "passengers.status": "Aprobado" } },
      {
        $group: {
          _id: "$passengers.user",
          approvedTripCount: { $sum: 1 }
        }
      },
      { $sort: { approvedTripCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: "$user.name",
          email: "$user.email",
          approvedTripCount: 1
        }
      }
    ]);

    res.status(200).json({
      msg: `Top ${limit} usuarios con más viajes aprobados.`,
      data: result
    });
  } catch (error) {
    console.error("Error al obtener usuarios con más viajes aprobados:", error);
    res.status(500).json({ msg: "Error interno al obtener usuarios." });
  }
};

exports.averageRevenuePerDriver = async (req, res) => {
  try {
    const now = new Date();

    const result = await Trip.aggregate([
      // Solo viajes finalizados
      { $match: { arrival: { $lt: now } } },

      // Solo si costPerPerson > 0 (omitimos viajes gratuitos)
      { $match: { costPerPerson: { $gt: 0 } } },

      // Proyectamos solo lo necesario
      {
        $project: {
          driver: 1,
          costPerPerson: 1,
          approvedCount: {
            $size: {
              $filter: {
                input: "$passengers",
                as: "p",
                cond: { $eq: ["$$p.status", "Aprobado"] }
              }
            }
          }
        }
      },

      // Calculamos total cobrado por viaje
      {
        $project: {
          driver: 1,
          totalRevenue: { $multiply: ["$costPerPerson", "$approvedCount"] },
          hasRevenue: { $gt: ["$approvedCount", 0] }
        }
      },

      // Solo viajes con al menos 1 pasajero aprobado
      { $match: { hasRevenue: true } },

      // Agrupamos por conductor
      {
        $group: {
          _id: "$driver",
          totalRevenue: { $sum: "$totalRevenue" },
          tripCount: { $sum: 1 }
        }
      },

      // Calculamos promedio
      {
        $project: {
          _id: 0,
          driverId: "$_id",
          averageRevenue: { $divide: ["$totalRevenue", "$tripCount"] },
          tripCount: 1,
          totalRevenue: 1
        }
      },

      // Traemos datos del conductor
      {
        $lookup: {
          from: "users",
          localField: "driverId",
          foreignField: "_id",
          as: "driver"
        }
      },
      { $unwind: "$driver" },
      {
        $project: {
          driverId: 1,
          name: "$driver.name",
          email: "$driver.email",
          averageRevenue: { $round: ["$averageRevenue", 2] },
          totalRevenue: { $round: ["$totalRevenue", 2] },
          tripCount: 1
        }
      },
      { $sort: { averageRevenue: -1 } }
    ]);

    res.status(200).json({
      msg: "Promedio cobrado por conductor en viajes finalizados.",
      data: result
    });
  } catch (error) {
    console.error("Error al calcular promedio por conductor:", error);
    res.status(500).json({ msg: "Error interno al calcular promedio por conductor." });
  }
};

exports.topTripsByCostPerPerson = async (req, res) => {
  try {
    const result = await Trip.aggregate([
      { $match: { costPerPerson: { $gt: 0 } } },

      { $sort: { costPerPerson: -1 } },

      { $limit: 5 },

      {
        $lookup: {
          from: "users",
          localField: "driver",
          foreignField: "_id",
          as: "driver"
        }
      },
      { $unwind: "$driver" },

      {
        $project: {
          _id: 0,
          tripId: "$_id",
          costPerPerson: 1,
          departure: 1,
          arrival: 1,
          driverName: "$driver.name",
          driverEmail: "$driver.email"
        }
      }
    ]);

    res.status(200).json({
      msg: "Top 5 viajes con mayor costo por persona.",
      data: result
    });
  } catch (error) {
    console.error("Error al obtener los viajes más caros:", error);
    res.status(500).json({ msg: "Error interno al obtener viajes más caros." });
  }
};

exports.topDriversWithMostFreeTrips = async (req, res) => {
  try {
    const result = await Trip.aggregate([
      { $match: { paymethod: "Gratuito" } },

      {
        $group: {
          _id: "$driver",
          freeTripCount: { $sum: 1 }
        }
      },

      { $sort: { freeTripCount: -1 } },

      { $limit: 5 },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "driver"
        }
      },
      { $unwind: "$driver" },

      {
        $project: {
          _id: 0,
          driverId: "$driver._id",
          name: "$driver.name",
          email: "$driver.email",
          freeTripCount: 1
        }
      }
    ]);

    res.status(200).json({
      msg: "Top 5 conductores con más viajes gratuitos.",
      data: result
    });
  } catch (error) {
    console.error("Error al obtener conductores con más viajes gratuitos:", error);
    res.status(500).json({ msg: "Error interno al obtener estadísticas." });
  }
};

exports.recentRegisteredUsers = async (req, res) => {
  try {
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    const users = await User.find({
      createdAt: { $gte: threeMonthsAgo }
    }).select("name email role type createdAt").sort({ createdAt: -1 });

    res.status(200).json({
      msg: "Usuarios registrados en los últimos 3 meses.",
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error("Error al obtener usuarios recientes:", error);
    res.status(500).json({ msg: "Error interno al obtener usuarios recientes." });
  }
};

exports.topDriversWithMostCancellations = async (req, res) => {
  try {
    const result = await Trip.aggregate([
      { $unwind: "$passengers" },

      { $match: { "passengers.status": "Cancelado" } },

      {
        $group: {
          _id: "$driver",
          cancelledCount: { $sum: 1 }
        }
      },

      { $sort: { cancelledCount: -1 } },

      { $limit: 5 },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "driver"
        }
      },
      { $unwind: "$driver" },

      // Proyectar campos útiles
      {
        $project: {
          _id: 0,
          driverId: "$driver._id",
          name: "$driver.name",
          email: "$driver.email",
          cancelledCount: 1
        }
      }
    ]);

    res.status(200).json({
      msg: "Top conductores con más usuarios cancelados.",
      data: result
    });

  } catch (error) {
    console.error("Error al obtener conductores con más cancelaciones:", error);
    res.status(500).json({ msg: "Error interno al obtener estadística." });
  }
};