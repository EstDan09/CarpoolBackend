const Trip = require("../models/Trip");
const mongoose = require("mongoose");


// Retorna el total de viajes con timepo de salida entre startHour y endHour
exports.getTripsByHour = async (req, res) => {
  try {
    const { startHour, endHour } = req.body
    
    if(!startHour && startHour!=0  || !endHour && endHour!=0){
      return res.status(400).json({ msg: "Campos obligatorios faltantes." });
    }

    const result = await Trip.aggregate([
      { $project: { "hour": { $hour: "$departure" } } },
      { $match: { "hour": { $gte: startHour, $lt: endHour } } },
      { $count : "total"}]);
    
    const trips = result.length ? result[0] : {total:0}
    
    res.status(200).json({ msg: "Datos obtenidos exitosamente.", data: trips });
  } catch (error) {
    console.error("Error al obtener datos:", error);
    res.status(500).json({ msg: "Error al obtener los datos." });
  }
};

// Retorna una estadistica con los viajes agrupados por franja horaria.
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

    console.log(result);

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