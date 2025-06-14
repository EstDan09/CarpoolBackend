const Trip = require("../models/Trip");

exports.registerTrip = async (req, res) => {
  try {
    const {
      startpoint,
      endpoint,
      departure,
      arrival,
      stops       = [],
      passengers  = [],
      driver,
      paymethod,
      costPerPerson
    } = req.body;

    if (
      !startpoint ||
      !endpoint  ||
      !departure ||
      !arrival   ||
      !driver    ||
      !paymethod ||
      costPerPerson == null
    ) {
      return res.status(400).json({
        msg: `Faltan campos obligatorios. Debes enviar:
          startpoint, endpoint, departure, arrival, driver, paymethod y costPerPerson`
      });
    }

    if (new Date(departure) >= new Date(arrival)) {
      return res
        .status(400)
        .json({ msg: "La hora de salida debe ser anterior a la de llegada." });
    }

    const métodos = ["Gratuito", "Sinpe", "Efectivo"];
    if (!métodos.includes(paymethod)) {
      return res
        .status(400)
        .json({ msg: `Método de pago inválido. Debe ser uno de: ${métodos.join(", ")}` });
    }
    if (typeof costPerPerson !== "number" || costPerPerson < 0) {
      return res
        .status(400)
        .json({ msg: "costPerPerson debe ser un número ≥ 0." });
    }
    const finalCost = paymethod === "Gratuito" ? 0 : costPerPerson;

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

    if (!["accepted", "denied"].includes(status)) {
      return res.status(400).json({ msg: "Estado inválido. Debe ser 'accepted' o 'denied'." });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ msg: "Viaje no encontrado." });
    }

    const stop = trip.stops.find(s => s.place.toString() === placeId);
    if (!stop) {
      return res.status(404).json({ msg: "Parada no encontrada." });
    }

    stop.status = status;
    await trip.save();

    res.status(200).json({ msg: "Estado de la parada actualizado correctamente.", data: trip });
  } catch (error) {
    console.error("Error al actualizar el estado de la parada:", error);
    res.status(500).json({ msg: "Error interno al actualizar el estado de la parada." });
  }
};

exports.addStopToTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { place } = req.body;

    if (!place) {
      return res.status(400).json({ msg: "ID del lugar (place) es requerido." });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ msg: "Viaje no encontrado." });
    }

    trip.stops.push({ place });
    await trip.save();

    res.status(200).json({ msg: "Parada agregada exitosamente.", data: trip });
  } catch (error) {
    console.error("Error al agregar parada:", error);
    res.status(500).json({ msg: "Error interno al agregar la parada." });
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

    // Verificar si ya existe el pasajero
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

exports.updatePassengerStatus = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { status } = req.body;

    if (!["accepted", "denied"].includes(status)) {
      return res.status(400).json({ msg: "Estado inválido. Debe ser 'accepted' o 'denied'." });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ msg: "Viaje no encontrado." });
    }

    const passenger = trip.passengers.find(p => p.user.toString() === userId);
    if (!passenger) {
      return res.status(404).json({ msg: "Pasajero no encontrado en el viaje." });
    }

    passenger.status = status;
    await trip.save();

    res.status(200).json({ msg: "Estado del pasajero actualizado exitosamente.", data: trip });
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








