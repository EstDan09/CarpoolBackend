const Trip = require("../models/Trip");
const mongoose = require("mongoose");


async function tripsByHour(startHour, endHour) {
  
  const trips = await Trip.aggregate([
    { $project: { "hour": { $hour: "$departure" } } },
    { $match: { "hour": { $gte: startHour, $lt: endHour } } },
    { $count : "total"}]);
  
  return trips.length ? trips[0] : {total:0}
   
}

// Retorna el total de viajes con timepo de salida entre startHour y endHour
exports.getTripsByHour = async (req, res) => {
  try {
    const { startHour, endHour } = req.body
    
    if(!startHour && startHour!=0  || !endHour && endHour!=0){
      return res.status(400).json({ msg: "Campos obligatorios faltantes." });
    }

    const trips = await tripsByHour(startHour, endHour);

    res.status(200).json({ msg: "Datos obtenidos exitosamente.", data: trips });
  } catch (error) {
    console.error("Error al obtener datos:", error);
    res.status(500).json({ msg: "Error al obtener los datos." });
  }
};

// Retorna una estadistica con los viajes agrupados por franja horaria.
exports.getTripsByHourRange = async (req, res) => {
  try {
    let morningTrips, afternoonTrips, nightTrips = {};

    const allTrips = await Trip.countDocuments();

    morningTrips = await tripsByHour(6, 12);
    morningTrips.percentage = morningTrips.total / allTrips * 100;
    
    afternoonTrips = await tripsByHour(12, 18);
    afternoonTrips.percentage = afternoonTrips.total / allTrips * 100;
    
    nightTrips.total = allTrips - (morningTrips.total + afternoonTrips.total);
    nightTrips.percentage = nightTrips.total / allTrips * 100;

    const data = {
      morningTrips: morningTrips,
      afternoonTrips: afternoonTrips,
      nightTrips: nightTrips,
      total: allTrips
    }

    res.status(200).json({ msg: "Datos obtenidos exitosamente.", data: data });
  } catch (error) {
    console.error("Error al obtener datos:", error);
    res.status(500).json({ msg: "Error al obtener los datos." });
  }
};