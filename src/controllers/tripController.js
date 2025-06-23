const Trip = require("../models/Trip");
const Vehicle = require("../models/Vehicle");
const mongoose = require("mongoose");

exports.registerTrip = async (req, res) => {
  try {
    const {
      startpoint,
      endpoint,
      departure,
      arrival,
      stops        = [],
      passengers   = [],
      driver,
      vehicle,
      passengerLimit, 
      paymethod,
      costPerPerson
    } = req.body;

    if (
      !startpoint      || !endpoint     ||
      !departure       || !arrival      ||
      !driver          || !vehicle      ||
      !paymethod       || passengerLimit == null ||
      costPerPerson    == null
    ) {
      return res.status(400).json({
        msg: `Faltan campos obligatorios. Debes enviar:
          startpoint, endpoint, departure, arrival, driver,
          vehicle, passengerLimit, paymethod y costPerPerson`
      });
    }

    if (new Date(departure) >= new Date(arrival)) {
      return res
        .status(400)
        .json({ msg: "La hora de salida debe ser anterior a la de llegada." });
    }

    const métodos = ["Gratuito", "Sinpe", "Efectivo"];
    if (!métodos.includes(paymethod)) {
      return res.status(400).json({
        msg: `Método de pago inválido. Debe ser uno de: ${métodos.join(", ")}`
      });
    }
    if (typeof costPerPerson !== "number" || costPerPerson < 0) {
      return res
        .status(400)
        .json({ msg: "costPerPerson debe ser un número ≥ 0." });
    }
    const finalCost = paymethod === "Gratuito" ? 0 : costPerPerson;

    const approvedInitCount = passengers.filter(p => p.status === "Aprobado").length;
    if (approvedInitCount > passengerLimit) {
      return res.status(400).json({
        msg: `No puedes registrar más de ${passengerLimit} pasajeros aprobados (enviaste ${approvedInitCount}).`
      });
    }

    for (const s of stops) {
      if (!s.place) {
        return res
          .status(400)
          .json({ msg: "Cada parada debe traer su campo place (ID)." });
      }
    }
    for (const p of passengers) {
      if (!p.user) {
        return res
          .status(400)
          .json({ msg: "Cada pasajero debe traer su campo user (ID)." });
      }
    }

    const trip = new Trip({
      startpoint,
      endpoint,
      departure,
      arrival,
      stops,
      passengers,
      driver,
      vehicle,
      passengerLimit,
      paymethod,
      costPerPerson: finalCost
    });

    await trip.save();

    return res
      .status(201)
      .json({ msg: "Viaje registrado exitosamente.", data: trip });

  } catch (error) {
    console.error("Error al registrar el viaje:", error);
    return res
      .status(500)
      .json({ msg: "Error interno al registrar el viaje." });
  }
};

exports.getTrips = async (_req, res) => {
  try {
    const trips = await Trip.find()
      .populate("startpoint")
      .populate("endpoint")
      .populate("driver")
      .populate("passengers.user")
      .populate("stops.place")
      .lean();

    res.status(200).json({ msg: "Viajes obtenidos exitosamente.", data: trips });
  } catch (error) {
    console.error("Error al obtener los viajes:", error);
    res.status(500).json({ msg: "Error interno al obtener los viajes." });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id)
      .populate("startpoint")
      .populate("endpoint")
      .populate("driver")
      .populate("passengers.user")
      .populate("stops.place");

    if (!trip) {
      return res.status(404).json({ msg: "Viaje no encontrado." });
    }

    res.status(200).json({ msg: "Viaje obtenido exitosamente.", data: trip });
  } catch (error) {
    console.error("Error al obtener el viaje:", error);
    res.status(500).json({ msg: "Error interno al obtener el viaje." });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTrip = await Trip.findByIdAndDelete(id);

    if (!deletedTrip) {
      return res.status(404).json({ msg: "Viaje no encontrado para eliminar." });
    }

    res.status(200).json({ msg: "Viaje eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar el viaje:", error);
    res.status(500).json({ msg: "Error interno al eliminar el viaje." });
  }
};

exports.updateStopStatus = async (req, res) => {
  try {
    const { id, placeId } = req.params;
    const { status } = req.body;

    // Mapeo de estados
    const mapping = {
      accepted: "Aprobado",
      denied:   "Rechazado"
    };
    const newStatus = mapping[status];
    if (!newStatus) {
      return res
        .status(400)
        .json({ msg: "Estado inválido. Debe ser 'accepted' o 'denied'." });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ msg: "Viaje no encontrado." });
    }

    // Busco la parada por placeId
    const stop = trip.stops.find(s => s.place.toString() === placeId);
    if (!stop) {
      return res.status(404).json({ msg: "Parada no encontrada." });
    }

    // Actualizo y guardo
    stop.status = newStatus;
    await trip.save();

    res
      .status(200)
      .json({ msg: "Estado de la parada actualizado correctamente.", data: trip });
  } catch (error) {
    console.error("Error al actualizar el estado de la parada:", error);
    res
      .status(500)
      .json({ msg: "Error interno al actualizar el estado de la parada." });
  }
};

exports.addStopToTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { place, user } = req.body;

    if (!place || !mongoose.Types.ObjectId.isValid(place)) {
      return res.status(400).json({ msg: "ID de lugar (place) inválido." });
    }
    if (user && !mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ msg: "ID de usuario inválido." });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ msg: "Viaje no encontrado." });
    }

    trip.stops.push({
      place,
      status: "Pendiente",
      passengersId: user ? [user] : []
    });

    await trip.save();
    res.status(200).json({ msg: "Parada solicitada exitosamente.", data: trip });

  } catch (error) {
    console.error("Error al solicitar parada:", error);
    res.status(500).json({ msg: "Error interno al agregar la parada." });
  }
};

exports.addUserToStop = async (req, res) => {
  try {
    const { id, placeId } = req.params;
    const { user } = req.body;

    if (!user || !mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ msg: "ID de usuario inválido." });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ msg: "Viaje no encontrado." });
    }

    const stop = trip.stops.find(s => s.place.toString() === placeId);
    if (!stop) {
      return res.status(404).json({ msg: "Parada no encontrada." });
    }

    if (stop.status !== "Aprobado") {
      return res.status(400).json({
        msg: "Sólo puedes agregar usuarios a una parada 'Aprobado'."
      });
    }

    // Evito duplicados
    if (stop.passengersId.some(u => u.toString() === user)) {
      return res.status(400).json({
        msg: "El usuario ya está agregado en esta parada."
      });
    }

    stop.passengersId.push(user);
    await trip.save();

    res.status(200).json({
      msg: "Usuario agregado a la parada exitosamente.",
      data: trip
    });

  } catch (error) {
    console.error("Error al agregar usuario a la parada:", error);
    res.status(500).json({ msg: "Error interno al agregar usuario a la parada." });
  }
};

exports.addPassengerToTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req.body;

    if (!user) {
      return res.status(400).json({ msg: "ID del usuario es requerido." });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ msg: "Viaje no encontrado." });
    }

    const alreadyAdded = trip.passengers.find(p => p.user.toString() === user);
    if (alreadyAdded) {
      return res.status(400).json({ msg: "Este pasajero ya fue agregado." });
    }

    trip.passengers.push({ user });
    await trip.save();

    res.status(200).json({ msg: "Pasajero agregado exitosamente.", data: trip });
  } catch (error) {
    console.error("Error al agregar pasajero:", error);
    res.status(500).json({ msg: "Error interno al agregar el pasajero." });
  }
};

exports.removeUserFromStop = async (req, res) => {
  try {
    const { id, placeId } = req.params;
    const { user } = req.body;

    if (!user || !mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ msg: "ID de usuario inválido." });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de viaje inválido." });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ msg: "Viaje no encontrado." });
    }

    const stop = trip.stops.find(s => s.place.toString() === placeId);
    if (!stop) {
      return res.status(404).json({ msg: "Parada no encontrada." });
    }

    const idx = stop.passengersId.findIndex(u => u.toString() === user);
    if (idx === -1) {
      return res.status(400).json({ msg: "El usuario no está en esta parada." });
    }

    stop.passengersId.splice(idx, 1);
    await trip.save();

    res.status(200).json({
      msg: "Usuario eliminado de la parada exitosamente.",
      data: trip
    });
  } catch (error) {
    console.error("Error al eliminar usuario de la parada:", error);
    res.status(500).json({ msg: "Error interno al eliminar usuario de la parada." });
  }
};

exports.removePassengerFromTrip = async (req, res) => {
  try {
    const { id, userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "ID de usuario inválido." });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de viaje inválido." });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ msg: "Viaje no encontrado." });
    }

    const idx = trip.passengers.findIndex(p => p.user.toString() === userId);
    if (idx === -1) {
      return res.status(404).json({ msg: "Pasajero no encontrado en el viaje." });
    }

    trip.passengers.splice(idx, 1);
    await trip.save();

    res.status(200).json({
      msg: "Pasajero eliminado del viaje exitosamente.",
      data: trip
    });
  } catch (error) {
    console.error("Error al eliminar pasajero del viaje:", error);
    res.status(500).json({ msg: "Error interno al eliminar el pasajero del viaje." });
  }
};

exports.updatePassengerStatus = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { status } = req.body;

    const validos = ["Aprobado", "Rechazado", "Pendiente", "Cancelado"];
    if (!validos.includes(status)) {
      return res.status(400).json({ msg: "Estado inválido. Debe ser uno válido." });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ msg: "Viaje no encontrado." });
    }

    const passenger = trip.passengers.find(p => p.user.toString() === userId);
    if (!passenger) {
      return res.status(404).json({ msg: "Pasajero no encontrado en el viaje." });
    }

    if (status === "Aprobado") {
      const aprobados = trip.passengers.filter(p => p.status === "Aprobado").length;
      const yaAprobado = passenger.status === "Aprobado";
      const totalTras = yaAprobado ? aprobados : aprobados + 1;
      if (totalTras > trip.passengerLimit) {
        return res.status(400).json({
          msg: `Límite de ${trip.passengerLimit} pasajeros aprobados alcanzado (${aprobados}).`
        });
      }
    }

    passenger.status = status;
    await trip.save();

    res.status(200).json({
      msg: "Estado del pasajero actualizado exitosamente.",
      data: trip
    });
  } catch (error) {
    console.error("Error al actualizar estado del pasajero:", error);
    res.status(500).json({ msg: "Error interno al actualizar el estado del pasajero." });
  }
};

exports.getTripPassengers = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id)
      .populate("passengers.user", "name email") 
      .lean();

    if (!trip) {
      return res.status(404).json({ msg: "Viaje no encontrado." });
    }

    const totalPassengers = trip.passengers.length;

    res.status(200).json({
      msg: "Pasajeros del viaje obtenidos exitosamente.",
      total: totalPassengers,
      passengers: trip.passengers,
    });
  } catch (error) {
    console.error("Error al obtener los pasajeros del viaje:", error);
    res.status(500).json({ msg: "Error interno al obtener los pasajeros." });
  }
};

exports.getAllTripsWithPassengerCount = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("startpoint", "name")          
      .populate("endpoint", "name")
      .populate("driver", "name email")
      .populate("passengers.user", "name email")
      .lean(); 

    const tripsWithCount = trips.map(trip => ({
      ...trip,
      passengerCount: trip.passengers.length
    }));

    res.status(200).json({
      msg: "Viajes obtenidos exitosamente con cantidad de pasajeros.",
      data: tripsWithCount
    });
  } catch (error) {
    console.error("Error al obtener viajes con cantidad de pasajeros:", error);
    res.status(500).json({ msg: "Error interno al obtener los viajes." });
  }
};

exports.getTripsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, driver } = req.query;

    if (!userId) {
      return res.status(400).json({ msg: "ID del usuario es requerido." });
    }

    let query;

    if (driver === "true") {
      query = { driver: userId };
    } else {
      const matchStatus = (status && status !== "all") ? status : null;

      query = matchStatus
        ? { passengers: { $elemMatch: { user: userId, status: matchStatus } } }
        : { "passengers.user": userId };
    }

    const trips = await Trip.find(query)
      .populate("startpoint", "name")
      .populate("endpoint", "name")
      .populate("driver", "name email")
      .populate("passengers.user", "name email")
      .populate("stops.place", "name")
      .lean();

    res.status(200).json({
      msg: "Viajes encontrados correctamente.",
      count: trips.length,
      data: trips
    });
  } catch (error) {
    console.error("Error al obtener viajes del usuario:", error);
    res.status(500).json({ msg: "Error interno al obtener los viajes." });
  }
};

exports.cancelPassengerTrip = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ msg: "Viaje no encontrado." });
    }

    const passenger = trip.passengers.find(p => p.user.toString() === userId);
    if (!passenger) {
      return res.status(404).json({ msg: "Pasajero no encontrado en el viaje." });
    }

    if (passenger.status === "Cancelado") {
      return res.status(400).json({ msg: "El pasajero ya ha cancelado este viaje." });
    }

    passenger.status = "Cancelado";
    await trip.save();

    res.status(200).json({
      msg: "El pasajero ha cancelado su participación en el viaje.",
      data: trip
    });
  } catch (error) {
    console.error("Error al cancelar la participación del pasajero:", error);
    res.status(500).json({ msg: "Error interno al cancelar participación del pasajero." });
  }
};

exports.getTripsParams = async (req, res) => {
  try {
    const { startDate, endDate, institutionId, endpoint } = req.body;

    if (!startDate ||!endDate) {
      return res.status(400).json({ msg: "Los campos startDate y endDate son obligatorios." });
    }

    const matchStage = {
      arrival: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };
    if (endpoint) {
        matchStage.endpoint = new mongoose.Types.ObjectId(endpoint);
    }

    const matchInstitution = institutionId && institutionId !== "all";

    const trips = await Trip.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "driver",
          foreignField: "_id",
          as: "driver"
        }
      },
      { $unwind: "$driver" },
      ...(matchInstitution ? [
        {
          $match: {
            "driver.institutionId": new mongoose.Types.ObjectId(institutionId)
          }
        }
      ] : []),
      {
        $lookup: {
          from: "places",
          localField: "startpoint",
          foreignField: "_id",
          as: "startpoint"
        }
      },
      { $unwind: "$startpoint" },
      {
        $lookup: {
          from: "places",
          localField: "endpoint",
          foreignField: "_id",
          as: "endpoint"
        }
      },
      { $unwind: "$endpoint" },
      {
        $lookup: {
          from: "places",
          localField: "stops.place",
          foreignField: "_id",
          as: "stopPlaces"
        }
      },
      {
        $project: {
          _id: 1,
          departure: 1,
          arrival: 1,
          paymethod: 1,
          costPerPerson: 1,
          passengers: 1,
          stops: 1,
          vehicle: 1,
          passengerLimit: 1,
          driver: {
            _id: "$driver._id",
            name: "$driver.name",
            email: "$driver.email",
            institutionId: "$driver.institutionId",
            photoUrl: "$driver.photoUrl"
          },
          startpoint: "$startpoint",
          endpoint: "$endpoint",
          stopPlaces: "$stopPlaces"
        }
      },
      { $sort: { departure: 1 } }
    ]);

    res.status(200).json({
      msg: "Viajes filtrados correctamente.",
      data: trips
    });
  } catch (error) {
    console.error("Error al filtrar viajes:", error);
    res.status(500).json({ msg: "Error interno al filtrar viajes." });
  }
};

exports.getModelVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id) 
      .select('model brand color')
      .lean();

    if (!vehicle) {
      return res.status(404).json({ msg: "Vehiculo no encontrado." });
    }

    res.status(200).json({ msg: "Vehiculo obtenido exitosamente.", data: vehicle });
  } catch (error) {
    console.error("Error al obtener el vehiculo:", error);
    res.status(500).json({ msg: "Error al obtener el vehiculo." });
  }

};

exports.registerTripsBulk = async (req, res) => {
  try {
    const { trips } = req.body;

    if (!Array.isArray(trips) || trips.length === 0) {
      return res.status(400).json({ msg: "Envía un array 'trips' con al menos un viaje." });
    }

    const created = await Trip.insertMany(trips);

    return res
      .status(201)
      .json({ msg: `${created.length} viajes creados exitosamente.`, data: created });
  } catch (error) {
    console.error("Error al registrar viajes bulk:", error);
    return res.status(500).json({ msg: "Error interno al crear viajes bulk." });
  }
};









