const Trip = require("../models/Trip");

exports.registerTrip = async (req, res) => {
  try {
    const { startpoint, endpoint, departure, arrival, stops, passengers, driver } = req.body;

    if (!startpoint || !endpoint || !departure || !arrival || !driver) {
      return res.status(400).json({ msg: "Campos obligatorios faltantes." });
    }

    const newTrip = new Trip({
      startpoint,
      endpoint,
      departure,
      arrival,
      stops: stops || [],
      passengers: passengers || [],
      driver
    });

    await newTrip.save();

    res.status(201).json({ msg: "Viaje registrado exitosamente.", data: newTrip });
  } catch (error) {
    console.error("Error al registrar viaje:", error);
    res.status(500).json({ msg: "Error al registrar el viaje." });
  }
};

exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("startpoint endpoint driver passengers stops.place");

    res.status(200).json({ msg: "Viajes obtenidos exitosamente.", data: trips });
  } catch (error) {
    console.error("Error al obtener viajes:", error);
    res.status(500).json({ msg: "Error al obtener los viajes." });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id)
      .populate("startpoint endpoint driver passengers stops.place");

    if (!trip) {
      return res.status(404).json({ msg: "Viaje no encontrado." });
    }

    res.status(200).json({ msg: "Viaje obtenido exitosamente.", data: trip });
  } catch (error) {
    console.error("Error al obtener el viaje:", error);
    res.status(500).json({ msg: "Error al obtener el viaje." });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Trip.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ msg: "Viaje no encontrado para eliminar." });
    }

    res.status(200).json({ msg: "Viaje eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar el viaje:", error);
    res.status(500).json({ msg: "Error al eliminar el viaje." });
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
  
      const stop = trip.stops.find(stop => stop.place.toString() === placeId);
      if (!stop) {
        return res.status(404).json({ msg: "Parada no encontrada en el viaje." });
      }
  
      stop.status = status;
      await trip.save();
  
      res.status(200).json({ msg: "Estado de parada actualizado exitosamente.", data: trip });
    } catch (error) {
      console.error("Error al actualizar estado de parada:", error);
      res.status(500).json({ msg: "Error al actualizar el estado de la parada." });
    }
};
  
