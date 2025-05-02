const Trip = require("../models/Trip");
const mongoose = require("mongoose");

exports.getTripsByHour = async (req, res) => {
  try {
    const { startHour, endHour } = req.body

    if(!startHour && startHour!=0  || !endHour && endHour!=0){
      return res.status(400).json({ msg: "Campos obligatorios faltantes." });
    }

    let trips = await Trip.aggregate([
      { $project: { "hour": { $hour: "$departure" } } },
      { $match: { "hour": { $gte: startHour, $lte: endHour } } },
      { $count : "total"}]);
    
    trips = trips.lenght || [{total:0}]

    res.status(200).json({ msg: "Datos obtenidos exitosamente.", data: trips });
  } catch (error) {
    console.error("Error al obtener datos:", error);
    res.status(500).json({ msg: "Error al obtener los datos." });
  }
};